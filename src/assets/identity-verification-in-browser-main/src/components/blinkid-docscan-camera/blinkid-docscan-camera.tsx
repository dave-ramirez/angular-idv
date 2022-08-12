import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  Component,
  Method,
  State,
  Prop
} from '@stencil/core';
import {
  BlinkIdDocScanCameraConfig,
} from './blinkid-docscan-camera.model';
import {
  BlinkIdCombinedRecognizerResult,
  BlinkIdCombinedRecognizerSettings,
  RecognizerResultState,
  SignedPayload
} from '@microblink/blinkid-in-browser-sdk';
import {
  // EventScanSuccess,
  EventScanError
} from '@microblink/blinkid-in-browser-sdk/ui/src/utils/data-structures';
import { applyDefaultCombinedRecognizerSettings } from '../blinkid-docscan/blinkid-docscan.utils';
import { BlinkIdRecognizerName } from '../blinkid-docscan/blinkid-docscan.model';
import { consoleError, consoleWarn } from '../../utils/logging.utils';
import { getAppUrlOrigin } from '../../utils/url.utils';


/**
 * Component encapsulates BlinkID Camera DocScan logic in a favor of parent Identity Verification logic.
 *
 * All of the UI is rendered additionally, on demand, and is always open as a full-screen overlay.
 */
@Component({
  tag: 'blinkid-docscan-camera',
  styleUrl: 'blinkid-docscan-camera.css',
  shadow: true
})
export class BlinkIdDocScanCameraComponent {
  @State()
  inProgress: boolean;
  @Prop()
  config!: BlinkIdDocScanCameraConfig;
  @Method()
  async startScan(): Promise<void> {
    if (!this.loadDone) {
      consoleWarn('cannot start since load did not finish (bidc)');
      return;
    }

    if (this.inProgress) {
      consoleWarn('already in progress (bidc)');
      return;
    }

    this.inProgress = true;

    this.startListeners();

    this.simulateScanFromCameraButtonClick();
  }
  //
  private loadDone: boolean;
  private retryingOnScanError: boolean;
  // blinkID element
  private bidel: Element;
  private bidelRecognizers: string[];
  private bidelRecognizersSettings: Record<string, any>;
  private listenersStarted: boolean;

  constructor() {
    this.resetProcessingVars();
    this.loadDone = false;
    this.listenersStarted = false;
  }

  private resetProcessingVars = (): void => {
    this.inProgress = false;
    this.retryingOnScanError = false;
  };

  /* Lifecycle */
  async componentWillLoad(): Promise<void> {
    if (!this.config.resourcesAlreadyLoaded) {
      this.loadBlinkIdCoreModule(); // has to be first
    } else {
      this.loadDone = true;
      this.config.callbacks.onLoadDone?.();
    }
    this.prepareBidelArguments();
  }

  componentDidLoad(): void {
    this.startListeners(true);
  }

  private prepareBidelArguments = (): void => {
    // setup combined recognizer
    const combinedRecognizerSettings: Partial<BlinkIdCombinedRecognizerSettings> = {};
    applyDefaultCombinedRecognizerSettings(combinedRecognizerSettings);
    if (this.config.skipUnsupportedBack != null) {
      combinedRecognizerSettings.skipUnsupportedBack = this.config.skipUnsupportedBack;
    }

    // gather recognizers
    this.bidelRecognizers = [BlinkIdRecognizerName.BlinkIdCombinedRecognizer];
    this.bidelRecognizersSettings = {
      returnSignedJSON: true,
      [BlinkIdRecognizerName.BlinkIdCombinedRecognizer]: combinedRecognizerSettings
    };
  };

  /* Lifecycle */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    return (
      <div class="blinkid-docscan-camera">
        <blinkid-in-browser
          class={ {
            'not-displayed': !this.inProgress,
            'not-visible': true
          } }

          license-key={ this.config.blinkidLicence }
          engine-location={ `${getAppUrlOrigin()}${this.config.resourcesDirPath}blinkID/` }
          recognizers={ this.bidelRecognizers }
          recognizerOptions= { this.bidelRecognizersSettings }

          scan-from-image='false'
          hide-feedback='true'
          hide-loading-and-error-ui='true'
          allow-hello-message='false'
          enable-drag='false'
          include-success-frame='true'

          ref={ (el) => { if(!this.bidel) { this.bidel = el; } } }
        ></blinkid-in-browser>
      </div>
    );
  }

  /* BlinkID listeners */

  private startListeners = (preStart = false): void => {
    if (!preStart) {
      this.startBlinkIdCloseListener();
    }

    if (this.listenersStarted) { return; }

    this.startBlinkIdFatalErrorListener();
    this.startBlinkIdScanErrorListener();
    this.startBlinkIdScanSuccessListener();
    this.listenersStarted = true;
  };

  private startBlinkIdFatalErrorListener = (): void => {
    this.bidel.addEventListener('fatalError', (event: CustomEvent<EventScanError>) => {
      const { message } = event.detail;
      consoleError(message);
      this.config.callbacks.onLoadDone?.(); // cleaning
      if (navigator.onLine) {
        this.config.callbacks.onError('ERROR_LICENSE');
      } else {
        this.config.callbacks.onError('ERROR_NETWORK');
      }
      this.inProgress = false;
    });
  };

  private startBlinkIdScanErrorListener = (): void => {
    this.bidel.addEventListener('scanError', () => {
      if (!this.retryingOnScanError) {
        consoleError('scan error, retrying');
        this.retryingOnScanError = true;
        this.inProgress = false;
        this.startScan();
      } else {
        consoleError('scan error, retry failed');
        this.retryingOnScanError = false;
        this.config.callbacks.onError('ERROR');
        this.inProgress = false;
      }
    });
  };

  private startBlinkIdScanSuccessListener = (): void => {
    this.bidel.addEventListener('scanSuccess', (event: CustomEvent<any>) => {
      const originalData = event.detail.recognizer as BlinkIdCombinedRecognizerResult;
      const originalDataSigningResult = event.detail.resultSignedJSON as SignedPayload;

      if (originalData.state === RecognizerResultState.Valid) {
        this.config.callbacks.onSuccess({
          originalData,
          originalDataJSON: originalDataSigningResult.payload,
          originalDataJSONSignature: originalDataSigningResult.signature,
          originalDataJSONSignatureVersion: originalDataSigningResult.signatureVersion
        });
      } else {
        this.config.callbacks.onError('ERROR');
      }

      this.inProgress = false;
    });
  };

  private startBlinkIdCloseListener = (): void => {
    const closeButton = this.bidel
      .shadowRoot.querySelector('mb-container')
      .querySelector('mb-component')
      .shadowRoot.querySelector('#mb-overlay-camera-experience')
      .querySelector('.holder')
      .querySelector('mb-camera-experience')
      .shadowRoot.querySelector('mb-camera-toolbar')
      .shadowRoot.querySelector('header')
      .querySelector('.close-button') as HTMLButtonElement;

    closeButton.addEventListener('click', () => {
      this.config.callbacks.onClose?.();
      this.inProgress = false;
    });
  };

  private simulateScanFromCameraButtonClick = (): void => {
    const scanFromCameraButtonElement = this.bidel
      .shadowRoot.querySelector('mb-container')
      .querySelector('mb-component') // polyfill problem
      .shadowRoot.querySelector('#mb-screen-action')
      .querySelector('.action-buttons')
      .children[0] as HTMLButtonElement;
    scanFromCameraButtonElement.click();
  };

  /* blinkid load */

  private loadBlinkIdCoreModule = (): void => {
    const script = document.createElement('script');
    script.onload = () => {
      this.loadDone = true;
      this.config.callbacks.onLoadDone();
    };
    script.src = `${this.config.resourcesDirPath}blinkID/ui/blinkid-in-browser/blinkid-in-browser.esm.js`;
    script.type = 'module';
    script.async = false;
    document.head.appendChild(script);
  };
}