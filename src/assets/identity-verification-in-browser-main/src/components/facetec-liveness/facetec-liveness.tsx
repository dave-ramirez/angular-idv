import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  Component,
  Method,
  Prop,
  State,
  Host
} from '@stencil/core';
import {
  FaceTecConnector,
  FaceTecConnectorConfig,
  FaceTecConnectorCallbacks,
  FaceTecConnectorResult,
  FaceTecConnectorInitParams,
  FaceTecSessionResult,
  FaceTecSessionResultVerificationResult
} from '../../utils/faceTecConnector';
import {
  VerifyServerApiClient
} from '../../utils/verify-server.utils';
import {
  FaceLivenessConfig,
} from './facetec-liveness.model';
import { adjustToValidNewLineCharacters } from '../../utils/regex.utils';
import { VerifyServerSaveLivenessImagesDTO } from '../../dto/verify-server.dto';
import { ButtonIcon } from '../button-icon-round/button-icon-round.model';
import { consoleLog, consoleWarn } from '../../utils/logging.utils';

const HAS_LOBBY_DEFAULT = true;
const SKIP_LOBBY_DEFAULT = false;
const SUCCESS_DELAY_MS = 3500;

/**
 * Component encapsulates Liveness Check logic in a favor of parent Identity Verification logic.
 *
 * All of the UI is rendered additionally, on demand, and is always open as a full-screen overlay.
 */
@Component({
  tag: 'facetec-liveness',
  styleUrl: 'facetec-liveness.css',
  shadow: true
})
export class FacetecLivenessComponent {
  @State()
  inProgress: boolean;
  @State()
  startingInProgress: boolean;
  @State()
  showRetryLayer: boolean;
  @State()
  retryLayerErrorCode: FaceTecConnectorResult;
  @State()
  showLobby: boolean;
  @Prop()
  hasLobby = HAS_LOBBY_DEFAULT;
  @Prop()
  config!: FaceLivenessConfig;
  @Method()
  async enroll(skipLobby = SKIP_LOBBY_DEFAULT): Promise<void> {
    if (!this.loadDone) {
      consoleWarn('cannot start since load did not finish (ft)');
      return;
    }

    this.config.callbacks.onStart();

    if (skipLobby) {
      this.showLobby = false;
    } else {
      this.showLobby = true;
    }

    if (this.hasLobby && !skipLobby) {
      this.config.callbacks.onStartDone();
      return;
    }

    // if hidden the automatically enroll
    await this.enrollInternal();
  }
  @Method()
  async reset(): Promise<void> {
    this.resetProcessingVars();
  }

  private loadDone = false;
  private faceTecConnector: FaceTecConnector;

  constructor() {
    this.resetProcessingVars();
  }

  private enrollInternal = (): void => {
    if (this.inProgress) {
      consoleWarn('already in progress (ft)');
      return;
    }

    this.inProgress = true;
    this.startingInProgress = true;

    if (!this.faceTecConnector) {
      this.initFaceTecConnector();
    }

    this.faceTecConnector.startEnrollment();
  };

  /* Lifecycle */
  async componentWillLoad(): Promise<void> {
    this.loadFaceTecCoreScripts(); // has to be first
  }

  private close = (hideLobby?: boolean): void => {
    this.inProgress = false;
    this.showLobby = hideLobby == null ? this.hasLobby : !hideLobby;
  };

  private resetProcessingVars = (): void => {
    this.showLobby = false;
    this.inProgress = false;
    this.startingInProgress = false;
    this.faceTecConnector = null;
    this.showRetryLayer = false;
    this.retryLayerErrorCode = null;
  };

  private initFaceTecConnector = (): void => {
    const initializeInProduction = true; // always true from now on (06.02.2022)
    // 1. prepare config object
    const config: FaceTecConnectorConfig = {
      initializeInProduction,
      getInitParams: async (): Promise<FaceTecConnectorInitParams> => {
        try {
          // 1. session tokens and ecnription keys
          const responseDTO = await VerifyServerApiClient.beginFacetecSession();
          const initParams = new FaceTecConnectorInitParams(
            responseDTO.sessionToken,
            responseDTO.deviceKeyIdentifier,
            adjustToValidNewLineCharacters(responseDTO.faceScanEncryptionKey),
            adjustToValidNewLineCharacters(responseDTO.productionKeyText)
          );
          // 2. add resources directories
          initParams.resourcesDirectory = `${this.config.resourcesDirPath}faceTec/resources`;
          initParams.imagesDirectory = `${this.config.resourcesDirPath}faceTec/images`;

          return initParams;
        } catch(err) {
          return null;
        }
      },
      verifyEnrollment3D: async (
        faceTecSessionResult: FaceTecSessionResult,
        facetecUserAgent: string
      ): Promise<FaceTecSessionResultVerificationResult> => {
        try {
          const responseDTO = await VerifyServerApiClient.enrollment3d(
            {
              faceScan: faceTecSessionResult.faceScan,
              auditTrailImage: faceTecSessionResult.auditTrail[0],
              lowQualityAuditTrailImage: faceTecSessionResult.lowQualityAuditTrail[0]
            },
            facetecUserAgent
          );

          const state: 'PROCESSED' | 'NOT_PROCESSED' | 'NETWORK_ERROR' = !responseDTO.error
            ? (responseDTO.wasProcessed ? 'PROCESSED' : 'NOT_PROCESSED')
            : 'NETWORK_ERROR';

          let verificationSuccessful = false;
          if(state === 'PROCESSED') {
            const {
              sessionTokenCheckSucceeded,
              auditTrailVerificationCheckSucceeded,
              faceScanLivenessCheckSucceeded,
              replayCheckSucceeded
            } = responseDTO.faceScanSecurityChecks;
            verificationSuccessful = sessionTokenCheckSucceeded
              && auditTrailVerificationCheckSucceeded
              && faceScanLivenessCheckSucceeded
              && replayCheckSucceeded;
          }

          return new FaceTecSessionResultVerificationResult(
            state,
            verificationSuccessful,
            responseDTO.scanResultBlob
          );
        } catch (err) {
          return new FaceTecSessionResultVerificationResult(
            'NETWORK_ERROR',
            false,
            null
          );
        }
      }
    };
    // 2. prepare callbacks object
    const callbacks: FaceTecConnectorCallbacks = {
      onInitializationDone: () => { // result: boolean
      },
      onSessionLaunchDone: () => { // result: boolean
        this.config.callbacks.onStartDone();
        this.startingInProgress = false;
      },
      onResult: (result: FaceTecConnectorResult, auditTrailImagesBase64?: string[]) => {
        this.config.callbacks.onLoadDone?.(); // cleaning

        if (result === FaceTecConnectorResult.VERIFIED) {
          this.sendAuditTrailImagesToServer(auditTrailImagesBase64);
          setTimeout(
            () => {
              this.config.callbacks.onFinish({
                success: {
                  faceTecUserImageBase64: auditTrailImagesBase64[0]
                }
              });
              this.close(true);
            },
            SUCCESS_DELAY_MS
          );
        }
        else if (result === FaceTecConnectorResult.CANCELED_BY_USER) {
          this.config.callbacks.onFinish();
          this.close();
        }
        else {
          if (result === FaceTecConnectorResult.NETWORK_ERROR) {
            this.config.callbacks.onNetworkProblems();
          }
          this.openRetryDialog(result);
        }
      }
    };
    // 3. instantiate connector object for later use
    this.faceTecConnector = new FaceTecConnector(config, { callbacks });
  };

  private sendAuditTrailImagesToServer = async (imagesBase64: string[]): Promise<void> => {
    if (imagesBase64 == null || imagesBase64.length === 1) {
      consoleLog('save additional images result: 1');
      return;
    }

    try {
      const imagesWithoutFirst = [...imagesBase64];
      imagesWithoutFirst.shift();
      await VerifyServerApiClient.saveAdditionalLivenessImages(
        { images: imagesWithoutFirst } as VerifyServerSaveLivenessImagesDTO,
      );
      consoleLog('save additional images result: 2');
    } catch (err) {
      consoleLog('save additional images result: 3');
    }
  };

  /* Lifecycle */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    return (
      <Host>
        { this.hasLobby && this.showLobby && (
          <div class="facetec-liveness-lobby">
            <div class="option">
              <p class="button">
                <button-icon-round
                  isDisabled={ this.inProgress }
                  icon={ ButtonIcon.Camera }
                  callbacks={ { onClick: () => { this.enrollInternal(); } } }
                ></button-icon-round>
              </p>
              <p class="text">
                Retake a selife
              </p>
            </div>
          </div>
        ) }
        { this.inProgress && this.startingInProgress && (
          <processing-layer></processing-layer>
        ) }
        { this.inProgress && !this.startingInProgress && (
          <div class="in-progress-fullscreen-background"></div>
        ) }
        <facetec-liveness-retry-layer
          show={ this.showRetryLayer }
          errorCode={ this.retryLayerErrorCode }
          onYes={ () => {
            // order is important
            this.closeRetryDialog();
            this.faceTecConnector.startEnrollment();
          } }
          onNo={ () => {
            this.config.callbacks.onFinish();
            this.close();
            this.closeRetryDialog();
          } }
        ></facetec-liveness-retry-layer>
      </Host>
    );
  }

  private openRetryDialog = (errorCode: FaceTecConnectorResult): void => {
    this.retryLayerErrorCode = errorCode;
    this.showRetryLayer = true;
  };

  private closeRetryDialog = (): void => {
    this.retryLayerErrorCode = null;
    this.showRetryLayer = false;
  };

  private loadFaceTecCoreScripts = (): void => {
    let script0Loaded = false;
    let script1Loaded = false;
    // prerequisite script
    const script0 = document.createElement('script');
    script0.onload = () => {
      script0Loaded = true;
      if (script0Loaded && script1Loaded) {
        this.loadDone = true;
        this.config.callbacks.onLoadDone?.();
      }
    };
    script0.src = `${this.config.resourcesDirPath}faceTec/prerequisite.js`;
    script0.type = 'text/javascript';
    script0.async = false;
    document.head.appendChild(script0);
    // core script
    const script1 = document.createElement('script');
    script1.onload = () => {
      script1Loaded = true;
      if (script0Loaded && script1Loaded) {
        this.loadDone = true;
        this.config.callbacks.onLoadDone?.();
      }
    };
    script1.src = `${this.config.resourcesDirPath}faceTec/FaceTecSDK.js`;
    script1.type = 'text/javascript';
    script1.async = false;
    document.head.appendChild(script1);
  };
}
