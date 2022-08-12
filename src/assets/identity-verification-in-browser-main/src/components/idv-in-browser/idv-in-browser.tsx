import environment from '../../environment';
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  Component,
  Event,
  EventEmitter,
  FunctionalComponent,
  Host,
  Method,
  Prop,
  State
} from '@stencil/core';
import { IDVStepName } from '../../shared';
import {
  setResourcesDirPath as globalSetResourcesDirectory,
  setLicense as globalSetLicense,
  setDevMode as globalSetDevMode,
  setDocscanSkipUnsupportedBack as globalSetDocscanSkipUnsupportedBack,
  getResourcesDirPath as globalGetResourcesDirPath,
  getDevMode as globalGetDevMode,
} from '../../global';
import { FlowState, VerificationResult } from '../flow-manager/flow-manager.model';
import {
  IdvInBrowserConfig,
  IdvInBrowserResult,
} from './idv-in-browser.model';
import {
  loadMainCss,
  loadSatoshiFont,
  loadBootstrap,
  calcAndSetVerifyServerUserAgent
} from './idv-in-browser.utils';
import axios from 'axios';
import { isBrowserSupported } from '@microblink/blinkid-in-browser-sdk';
import { consoleLog } from '../../utils/logging.utils';
import { VerifyServerApiClient } from '../../utils/verify-server.utils';
import { standardizePath, standardizeUrl } from '../../utils/url.utils';

@Component({
  tag: 'idv-in-browser',
  styleUrl: 'idv-in-browser.css',
  shadow: true
})
export class IdvInBrowserComponent {
  @State()
  prerequisitesValid = null;
  @State()
  flowManagerLoaded = false;
  @State()
  resourcesLoaded = false;
  @State()
  startInProgress: boolean;
  @State()
  restartInProgress: boolean;
  @State()
  verificationInProgress: boolean;
  @State()
  flowEndReached: boolean;
  @State()
  flowState: FlowState;
  @Prop()
  config?: IdvInBrowserConfig;
  @Method()
  async restart(): Promise<void> {
    consoleLog('identity verification restart requested');

    if (!this.isReady()) {
      return;
    }

    this.restartInProgress = true;
    this.resetProcessingVars();
    await this.flowManagerElement.reset();
    this.restartInProgress = false;
    consoleLog('identity verification restart succeeded');
  }
  @Event()
  result: EventEmitter<IdvInBrowserResult>
  @Event({ eventName: 'session-initialized' })
  sessionInitialized: EventEmitter<string>

  private readonly greetingsText = 'Verify your identity';
  private readonly flowManagerLoadTolleranceMs = 2000;
  private readonly verifySteps: IDVStepName[] = [
    IDVStepName.DOCUMENT_SCANNING,
    IDVStepName.FACETEC_LIVENESS
  ];
  private identityVerificationServerUrl: string;
  private flowManagerElement: HTMLFlowManagerElement;
  private isResultEmitted: boolean;

  constructor() {
    this.resetProcessingVars();
  }

  /* Lifecycle */
  async componentWillLoad(): Promise<void> {
    await this.initialize();
  }

  private resetProcessingVars = (): void => {
    this.startInProgress = false;
    this.restartInProgress = false;
    this.flowState = 'INITIAL';
    this.isResultEmitted = false;
  };

  /* Lifecycle */
  render() { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    return (
      <Host>
        <div class="idv-in-browser">
          { this.prerequisitesValid == null && (<LoadingLayer basic={ true }></LoadingLayer>) }
          { this.prerequisitesValid === false && (<UnavailableLayer></UnavailableLayer>) }
          { this.prerequisitesValid === true && (!this.flowManagerLoaded || !this.resourcesLoaded) && (
            <LoadingLayer></LoadingLayer>
          ) }
          <div class="content">
            <div class="greetings">{ this.greetingsText }</div>
            <button
              disabled={ this.areInputsDisabled() }
              class="primary small start-button"
              onClick={ () => { this.onStartClicked(); } }
            >
              { !this.startInProgress && this.flowState === 'INITIAL' && 'Start' }
              { !this.startInProgress && this.flowState === 'IN_PROGRESS' && 'Continue' }
              { !this.startInProgress && this.flowState === 'ERROR' && 'Restart' }
              { !this.startInProgress && this.flowState === 'FINISHED' && 'Done' }
              { !this.startInProgress && this.isTerminatingFlowErrorState() && 'Verification Unavailable' }
              { (this.startInProgress || this.restartInProgress) && (<icon-loader></icon-loader>) }
            </button>
          </div>
          {/* Flow Manager depends on a valid input config */}
          { this.prerequisitesValid === true && (
            <flow-manager
              steps={ this.verifySteps }
              callbacks= { {
                onLoaded: () => {
                  setTimeout(
                    () => {
                      this.flowManagerLoaded = true;
                    },
                    this.flowManagerLoadTolleranceMs
                  );
                },
                onClose: (flowState: FlowState, verificationResult?: VerificationResult) => {
                  this.handleFlowStateChange(flowState, verificationResult);
                },
                onSessionInitialized: (sessionId: string) => {
                  this.sessionInitialized.emit(sessionId);
                }
              } }
              ref={ (elm: HTMLFlowManagerElement) => {
                if (!this.flowManagerElement) {
                  this.flowManagerElement = elm;
                }
              } }
            ></flow-manager>
          ) }
        </div>
      </Host>
    );
  }

  /* Main logic */

  private onStartClicked = async () => {
    if (this.areInputsDisabled()) { return; }

    this.startInProgress = true;

    if (this.flowState === 'ERROR') {
      await this.restart();
    }

    await this.flowManagerElement.start();

    this.startInProgress = false;
  };

  private emitResult = (result: IdvInBrowserResult): void => {
    if (this.isResultEmitted) {
      // emit just one
      return;
    }

    this.isResultEmitted = true;

    this.result.emit(result);
  }

  private handleFlowStateChange = (newFlowState: FlowState, verificationResult?: VerificationResult): void => {
    this.flowState = newFlowState;

    if (this.flowState === 'INITIAL' || this.flowState === 'IN_PROGRESS') {
      // no action needed
      return;
    }

    if (this.flowState === 'FINISHED') {
      this.emitResult(verificationResult as IdvInBrowserResult);
      return;
    }

    if (
      this.flowState === 'ERROR_NETWORK_SESSION'
      || this.flowState === 'ERROR_NETWORK_VERIFICATION'
      || this.flowState === 'ERROR_NETWORK_OTHER'
    ) {
      this.emitResult(IdvInBrowserResult.ERROR_NETWORK);
      return;
    }

    if (
      this.flowState === 'ERROR'
      || this.flowState === 'ERROR_CONFIG'
    ) {
      this.emitResult(this.flowState as IdvInBrowserResult);
      return;
    }
  };

  private isTerminatingFlowErrorState = (): boolean => {
    return this.flowState === 'ERROR_CONFIG'
      || this.flowState === 'ERROR_NETWORK_SESSION'
      || this.flowState === 'ERROR_NETWORK_VERIFICATION'
      || this.flowState === 'ERROR_NETWORK_OTHER';
  }

  private areInputsDisabled = (): boolean => {
    return this.startInProgress
      || this.restartInProgress
      || this.flowState === 'FINISHED'
      || this.isTerminatingFlowErrorState();
  };

  /* Input config parsing */

  private isReady = (): boolean => {
    return this.prerequisitesValid && this.resourcesLoaded && this.flowManagerLoaded;
  };

  private initialize = async (): Promise<void> => {
    const firstValid = await this.validateAndParseInputConfig();

    VerifyServerApiClient.initialize(this.identityVerificationServerUrl);

    const secondValid = await this.validateBrowserCompatibility();
    const thirdValid = await this.validateVerifyServerUrl();

    this.prerequisitesValid = firstValid && secondValid && thirdValid;

    if (!this.prerequisitesValid) {
      return;
    }

    await calcAndSetVerifyServerUserAgent();

    await this.loadResources();
  };

  private validateVerifyServerUrl = async (): Promise<boolean> => {
    let pingSucceeded;
    try {
      await VerifyServerApiClient.ping();
      pingSucceeded = true;
    } catch (err) {
      this.emitResult(IdvInBrowserResult.ERROR_CONFIG);
      pingSucceeded = false;
    }

    return pingSucceeded;
  };

  private validateBrowserCompatibility = (): boolean => {
    const supported = isBrowserSupported();
    if (!supported) {
      this.emitResult(IdvInBrowserResult.ERROR_BROWSER_SUPPORT);
      return false;
    }

    return true;
  };

  private validateAndParseInputConfig = async (): Promise<boolean> => {
    if (
      this.config?.license == null
      || this.config?.identityVerificationServerUrl == null
    ) {
      this.emitResult(IdvInBrowserResult.ERROR_CONFIG);
      return false;
    }

    this.calcAndSaveResourcesDirectoryPath();

    if (!(await this.isResourcesDirPathValid())) {
      this.emitResult(IdvInBrowserResult.ERROR_CONFIG);
      return false;
    }

    this.calcAndSaveVerifyServerUrl();
    this.calcAndSaveLicense();
    this.calcAndSaveDevMode();
    this.saveDocscanSkipUnsupportedBack();
    return true;
  };

  private isResourcesDirPathValid = async (): Promise<boolean> => {
    try {
      const resourcesDirPath = globalGetResourcesDirPath();
      await axios.get(`${resourcesDirPath}ping.js`);
      return true;
    } catch (err) {
      return false;
    }
  };

  private calcAndSaveVerifyServerUrl = (): void => {
    let url = this.config?.identityVerificationServerUrl;
    url = standardizeUrl(url);
    this.identityVerificationServerUrl = standardizeUrl(url);
  };

  private calcAndSaveResourcesDirectoryPath = (): void => {
    let path = environment.idv_default_resources_directory_path;
    if (this.config && this.config.resourcesDirectoryPath) {
      path = this.config.resourcesDirectoryPath;
    }
    path = standardizePath(path);
    globalSetResourcesDirectory(path);
  };

  private calcAndSaveLicense = (): void => {
    globalSetLicense(this.config?.license);
  };

  private calcAndSaveDevMode = (): void => {
    let devMode = (() => {
      const devModeEnv = environment.idv_default_input_config_dev_mode.toLowerCase().trim();
      if (devModeEnv === 'true' || devModeEnv === '1') {
        return true;
      }
      return false;
    })();
    if (this.config && (this.config.devMode === true || this.config.devMode === false)) {
      devMode = this.config.devMode;
    }

    globalSetDevMode(devMode);
  };

  private saveDocscanSkipUnsupportedBack = () => {
    let docscanSkipUnsupportedBack = (() => {
      const skipEnv = environment.idv_default_input_config_skip_unsupported_back.toLowerCase().trim();
      if (skipEnv === 'true' || skipEnv === '1') {
        return true;
      }
      return false;
    })();
    if (this.config?.docscanSkipUnsupportedBack === true || this.config?.docscanSkipUnsupportedBack === false) {
      docscanSkipUnsupportedBack = this.config.docscanSkipUnsupportedBack;
    }
    globalSetDocscanSkipUnsupportedBack(docscanSkipUnsupportedBack);
  };

  /* Resources load */

  private loadResources = async (): Promise<void> => {
    if (this.resourcesLoaded) {
      return;
    }

    const resourcesDir = globalGetResourcesDirPath();
    const devMode = globalGetDevMode();

    let mainCssLoaded = false;
    let satoshiFontLoaded = false;
    let bootstrapLoaded = false;
    const markIfAllLoaded = () => {
      if (mainCssLoaded && satoshiFontLoaded && bootstrapLoaded) {
        this.resourcesLoaded = true;
      }
    };

    loadMainCss(
      devMode ? 'build/' : resourcesDir,
      () => {
        mainCssLoaded = true;
        markIfAllLoaded();
      }
    );

    loadSatoshiFont(
      resourcesDir,
      () => {
        satoshiFontLoaded = true;
        markIfAllLoaded();
      }
    );
    loadBootstrap(
      () => {
        bootstrapLoaded = true;
        markIfAllLoaded();
      }
    );
  };
}

/* Helper Functional Components */

interface LoadingLayerProps {
  basic?: boolean;
}

const LoadingLayer: FunctionalComponent<LoadingLayerProps> = (props: LoadingLayerProps) => {
  const basic = props.basic || false;
  return (
    <div class="feedback-overlay">
      { !basic && (<icon-loader fontSize="14px"></icon-loader>) }
      { basic && ('Loading') }
    </div>
  );
};

const UnavailableLayer: FunctionalComponent = () => {
  const text = 'Unavailable';
  /*
    Style is inline because main CSS file is not loaded in this case
  */
  return (
    <div
      style={ {
        position: 'absolute',
        'z-index': '1',
        left: '0px',
        right: '0px',
        width: '100%',
        height: '100%',
        'background-color': 'white',
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'center',
        'border': '1px solid lightgray',
        'border-radius': '5px',
        color: 'gray',
        'font-size': '14px'
      } }
    >{ text }</div>);
};
