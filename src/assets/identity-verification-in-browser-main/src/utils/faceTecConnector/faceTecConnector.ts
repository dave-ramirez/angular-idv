import {
  FaceTecCustomization, FaceTecSecurityWatermarkImage
} from './sdk-interface/FaceTecCustomization';
import {
  FaceTecFaceScanResultCallback,
  FaceTecSessionResult,
  FaceTecSessionStatus,
  InitializeCallback,
  FaceTecFaceScanProcessor,
  FaceTecSDKStatus,
  FaceTecVocalGuidanceMode,
  FaceTecAuditTrailType,
  FaceTecAuditTrailImagesToReturn
} from './sdk-interface/FaceTecPublicApi';
import { FaceTecSDK } from './sdk-interface/FaceTecSDK';
import {
  Callbacks,
  Config,
  Result,
  InitializationFailureReason,
  FaceTecSessionResultVerificationResult
} from './faceTecConnectorModels';
import faceTecDefaultStrings from './default-strings';
import { FaceTecConnectorInitParams } from '.';

// eslint-disable-next-line no-var
declare var FaceTecSDK: FaceTecSDK;

type SessionResultHandler = (
  sessionResult: FaceTecSessionResult,
  sessionCommands: FaceTecFaceScanResultCallback
) => void;

class SessionProcessor implements FaceTecFaceScanProcessor {
  constructor(
    sessionToken: string,
    private sessionResultHandler: SessionResultHandler
  ) {
    new FaceTecSDK.FaceTecSession(this, sessionToken);
  }

  onFaceTecSDKCompletelyDone = () => {
    // TODO: do we need some logic here?
  }

  processSessionResultWhileFaceTecSDKWaits = (
    sessionResult: FaceTecSessionResult,
    sessionCommands: FaceTecFaceScanResultCallback
  ) => {
    this.sessionResultHandler(sessionResult, sessionCommands);
  }
}

class FaceTecConnectorBuilder {
  private _config: Config;
  private _callbacks: Callbacks;

  constructor(config: Config) {
    this._config = config;
    this._callbacks = null;
  }

  public callbacks(callbacks: Callbacks): FaceTecConnectorBuilder {
    this._callbacks = callbacks;

    return this;
  }

  public build(): FaceTecConnector {
    return new FaceTecConnector(
      this._config,
      {
        callbacks: this._callbacks
      }
    );
  }
}

export class FaceTecConnector {
  // props
  private config: Config;
  private callbacks: Callbacks;
  // working vars
  private initParams: FaceTecConnectorInitParams;
  private isCancelled: boolean;
  private successfulSessionResultHandler: SessionResultHandler;
  private doFetchInitParams: boolean;

  public static Builder(config: Config): FaceTecConnectorBuilder {
    return new FaceTecConnectorBuilder(config);
  }

  constructor(
    config: Config,
    optional?: {
      callbacks?: Callbacks
    }
  ) {

    // mandatory props
    this.config = config;
    // optional props
    this.callbacks = null;
    if (optional != null) {
      const {
        callbacks
      } = optional;

      if (callbacks != null) {
        this.callbacks = callbacks;
      }
    }
    // working vars default
    this.isCancelled = false;
    this.doFetchInitParams = true;
  }

  public unload(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        FaceTecSDK.unload(() => {
          resolve();
        });
      } catch (err) {
        reject();
      }
    });
  }

  // 1. public starting point
  public startEnrollment(): void {
    /*
      Notice!
      All FaceTec sessions have the same flow. The only difference is in what kind of
      post-processing you request after a successfull session.
      This means that any other session type differs only in setting a different
      "successfulSessionResultCallback" callback function.
    */
    this.successfulSessionResultHandler = (
      sessionResult: FaceTecSessionResult,
      sessionCommands: FaceTecFaceScanResultCallback
    ) => {
      this.onSuccessfulEnrollmentSessionResult(
        sessionResult,
        sessionCommands
      );
    };
    this.start(); // async
  }

  // 2. internal starting point
  private async start(): Promise<void> {
    this.isCancelled = false;

    const status = FaceTecSDK.getStatus();

    if (this.doFetchInitParams) { // initially TRUE
      this.initParams = await this.config.getInitParams();
      this.doFetchInitParams = false;
    }

    if (status === FaceTecSDKStatus.Initialized) {
      this.launchSessionAndHandleResult();
    }
    else if (status === FaceTecSDKStatus.NeverInitialized) {
      this.initializeFaceTecSDK(
        // A) on success callback
        () => {
          if (this.callbacks && this.callbacks.onInitializationDone) {
            this.callbacks.onInitializationDone(true);
          }

          this.setupStrings();
  
          this.launchSessionAndHandleResult();
        },
        // B) on failure callback
        (reason: InitializationFailureReason) => {
          if (this.callbacks) {
            if (this.callbacks.onInitializationDone) {
              this.callbacks.onInitializationDone(false);
              this.callbacks.onSessionLaunchDone(false);
            }
  
            if (this.callbacks.onResult) {
              const result = this.mapInitFailureReasonToResult(reason);
              this.callbacks.onResult(result);
            }
          }
        }
      );
    }
    else {
      this.callbacks.onSessionLaunchDone(false);
      this.callbacks.onResult(Result.UNKNOWN_ERROR);
    }
  }

  // 3.
  private async initializeFaceTecSDK(
    onSuccessCallback: () => void,
    onFailureCallback: (reason: InitializationFailureReason) => void
  ) {
    let validInitParams;
    if (this.initParams == null) {
      this.doFetchInitParams = true;
      validInitParams = false;
    } else {
      validInitParams = this.areValidInitParams();
    }

    if (validInitParams) {
      const faceTecInitCallback: InitializeCallback = (completed: boolean) => {
        if (this.isCancelled) {
          onFailureCallback(InitializationFailureReason.CANCELED);
        } else if (completed) {
          onSuccessCallback();
        } else {
          onFailureCallback(InitializationFailureReason.CONFIG_KEYS_ERROR);
        }
      };

      FaceTecSDK.setResourceDirectory(this.initParams.resourcesDirectory);
      FaceTecSDK.setImagesDirectory(this.initParams.imagesDirectory);
      FaceTecSDK.auditTrailType = FaceTecAuditTrailType.FullResolution;
      FaceTecSDK.setMaxAuditTrailImages(FaceTecAuditTrailImagesToReturn.UP_TO_SIX);
      this.setupUICustomization();

      if (this.config.initializeInProduction) {
        FaceTecSDK.initializeInProductionMode(
          this.initParams.productionKeyText,
          this.initParams.deviceKeyIdentifier,
          this.initParams.faceScanEncriptionKey,
          faceTecInitCallback
        );
      } else {
        FaceTecSDK.initializeInDevelopmentMode(
          this.initParams.deviceKeyIdentifier,
          this.initParams.faceScanEncriptionKey,
          faceTecInitCallback
        );
      }

    } else {
      onFailureCallback(InitializationFailureReason.CONFIG_KEYS_NETWORK_FETCH_ERROR);
    }
  }

  private setupUICustomization(customization?: FaceTecCustomization): void {
    const customizationAdjusted = customization || this.getDefaultUICustomization();

    FaceTecSDK.setCustomization(customizationAdjusted);
  }

  private setupStrings(): void {
    FaceTecSDK.configureLocalization(faceTecDefaultStrings);
  }

  private areValidInitParams(): boolean {
    return !(
      this.initParams == null
      || this.initParams.sessionToken == null
      || this.initParams.deviceKeyIdentifier == null
      || this.initParams.faceScanEncriptionKey == null
      || (
        this.config.initializeInProduction
        && this.initParams.productionKeyText == null
      )
    );
  }

  // 4.
  private launchSessionAndHandleResult() {
    new SessionProcessor(
      this.initParams.sessionToken,
      (
        sessionResult: FaceTecSessionResult,
        sessionCommands: FaceTecFaceScanResultCallback
      ) => { this.handleSessionResult(sessionResult, sessionCommands); }
    );

    this.callbacks.onSessionLaunchDone(true);
  }

  private handleSessionResult(
    sessionResult: FaceTecSessionResult,
    sessionCommands: FaceTecFaceScanResultCallback
  ): void {
    const { status } = sessionResult;

    if (status === FaceTecSessionStatus.Timeout) {
      this.callbacks.onResult(Result.SESSION_TIMEOUT);
    }
    else if (
      status === FaceTecSessionStatus.UserCancelled
      || status === FaceTecSessionStatus.UserCancelledViaClickableReadyScreenSubtext
    ) {
      this.callbacks.onResult(Result.CANCELED_BY_USER);
    }
    else if (status === FaceTecSessionStatus.ContextSwitch) {
      this.callbacks.onResult(Result.CONTEXT_SWITCH);
    }
    else if (
      status === FaceTecSessionStatus.CameraNotEnabled
      || status === FaceTecSessionStatus.CameraNotRunning
    ) {
      sessionCommands.cancel();
      this.callbacks.onResult(Result.CAMERA_ERROR);
    }
    else if (status === FaceTecSessionStatus.NonProductionModeDeviceKeyIdentifierInvalid) {
      this.callbacks.onResult(Result.CONFIG_KEYS_ERROR);
    }
    else if (status === FaceTecSessionStatus.LandscapeModeNotAllowed) {
      this.callbacks.onResult(Result.ONLY_PORTRAIT_MODE_ALLOWED);
    }
    else if (
      status === FaceTecSessionStatus.UnknownInternalError
      || status === FaceTecSessionStatus.MissingGuidanceImages
    ) {
      this.callbacks.onResult(Result.UNKNOWN_ERROR);
    }
    else if (status === FaceTecSessionStatus.LockedOut) {
      this.callbacks.onResult(Result.LOCKED_OUT);
    }
    else if (status === FaceTecSessionStatus.SessionCompletedSuccessfully) {
      this.successfulSessionResultHandler(sessionResult, sessionCommands);
    }

    if (status !== FaceTecSessionStatus.SessionCompletedSuccessfully) {
      sessionCommands.cancel();
    }
  }

  private onVerificationFailed(
    result: FaceTecSessionResultVerificationResult,
    sessionCommands: FaceTecFaceScanResultCallback
  ): void {
    if (result.state === 'PROCESSED') {
      sessionCommands.proceedToNextStep(result.scanResultBlob);
    }
    else {
      this.callbacks.onResult(Result.UNKNOWN_ERROR);
      sessionCommands.cancel();
    }
  }

  private async onSuccessfulEnrollmentSessionResult(
    sessionResult: FaceTecSessionResult,
    sessionCommands: FaceTecFaceScanResultCallback
  ) {
    const userAgentString = FaceTecSDK.createFaceTecAPIUserAgentString(sessionResult.sessionId);
    const result = await this.config.verifyEnrollment3D(sessionResult, userAgentString);

    this.handleVerificationResult(result, sessionCommands, sessionResult.auditTrail);
  }

  private handleVerificationResult(
    result: FaceTecSessionResultVerificationResult,
    sessionCommands: FaceTecFaceScanResultCallback,
    auditTrail?: string[]
  ): void {
    const {
      state,
      verificationSuccessful,
      scanResultBlob
    } = result;

    if (state === 'PROCESSED') {
      if (verificationSuccessful) {
        this.callbacks.onResult(Result.VERIFIED, auditTrail);
      } else {
        this.onVerificationFailed(result, sessionCommands);
      }
      sessionCommands.proceedToNextStep(scanResultBlob);
    }
    else if (state === 'NETWORK_ERROR') {
      this.callbacks.onResult(Result.NETWORK_ERROR);
      sessionCommands.cancel();
    }
    else if (state === 'NOT_PROCESSED') {
      this.onVerificationFailed(result, sessionCommands);
    }
  }

  private mapInitFailureReasonToResult(reason: InitializationFailureReason): Result {
    switch(reason) {
    case InitializationFailureReason.CONFIG_KEYS_ERROR:
      return Result.CONFIG_KEYS_ERROR;
    case InitializationFailureReason.CONFIG_KEYS_NETWORK_FETCH_ERROR:
      return Result.NETWORK_ERROR;
    case InitializationFailureReason.CANCELED:
      return Result.CANCELED_BY_USER;
    default:
      return Result.UNKNOWN_ERROR;
    }
  }

  private getDefaultUICustomization(): FaceTecCustomization {
    const customization = new FaceTecSDK.FaceTecCustomization();
    // overlay
    customization.overlayCustomization.backgroundColor = 'transparent';
    customization.overlayCustomization.showBrandingImage = false;
    // frame
    customization.frameCustomization.borderColor = 'transparent';
    customization.frameCustomization.borderWidth = '1px';
    customization.frameCustomization.borderCornerRadius = '4px';
    // oval
    customization.ovalCustomization.strokeColor = 'transparent';
    // oval - paraboloid spinner
    customization.ovalCustomization.progressColor1 = 'var(--color-primary)';
    customization.ovalCustomization.progressColor2 = 'var(--color-primary)';
    // security watermark
    customization.securityWatermarkCustomization.securityWatermarkImage = FaceTecSecurityWatermarkImage.FaceTec;
    // cancel button
    customization.cancelButtonCustomization.location = 2; // custom: 3 | topright: 2
    // guidance
    customization.guidanceCustomization.readyScreenHeaderTextColor = 'var(--font-color-primary)';
    customization.guidanceCustomization.readyScreenHeaderFont = 'var(--font-family-default)';
    customization.guidanceCustomization.readyScreenSubtextTextColor = 'var(--font-color-secondary)';
    customization.guidanceCustomization.readyScreenSubtextFont = 'var(--font-family-default)';
    customization.guidanceCustomization.retryScreenHeaderTextColor = 'var(--font-color-primary)';
    customization.guidanceCustomization.retryScreenSubtextTextColor = 'var(--font-color-secondary)';
    customization.guidanceCustomization.buttonBackgroundNormalColor = 'var(--button-primary-color)';
    customization.guidanceCustomization.buttonBackgroundHighlightColor = 'var(--button-primary-color-hover)';
    customization.guidanceCustomization.buttonBackgroundDisabledColor = '#F3F4F6';
    customization.guidanceCustomization.buttonTextNormalColor = 'var(--button-primary-font-color)';
    customization.guidanceCustomization.buttonTextHighlightColor = 'var(--button-primary-font-color)';
    customization.guidanceCustomization.buttonTextDisabledColor = 'var(--button-primary-font-color)';
    customization.guidanceCustomization.buttonCornerRadius = 'var(--button-border-radius);'
    customization.guidanceCustomization.retryScreenOvalStrokeColor = 'white';
    // feedback bar
    customization.feedbackCustomization.backgroundColor = 'black';
    customization.feedbackCustomization.textColor = 'white';
    customization.feedbackCustomization.cornerRadius = '0px';
    customization.feedbackCustomization.shadow = 'none';
    // loader initial
    customization.initialLoadingAnimationCustomization.foregroundColor = 'white';
    customization.initialLoadingAnimationCustomization.backgroundColor = 'var(--color-primary)';
    customization.initialLoadingAnimationCustomization.animationRelativeScale = 1.2;
    customization.initialLoadingAnimationCustomization.messageFont = 'var(--font-family-default)';
    customization.initialLoadingAnimationCustomization.messageTextColor = 'var(--font-color-secondary)';
    // customization.initialLoadingAnimationCustomization.messageTextSize = '16px';
    // uploader
    customization.resultScreenCustomization.activityIndicatorColor = 'var(--color-secondary)';
    customization.resultScreenCustomization.uploadProgressTrackColor = 'var(--color-secondary)';
    customization.resultScreenCustomization.uploadProgressFillColor = 'var(--color-primary)';
    // final feedback
    customization.resultScreenCustomization.resultAnimationForegroundColor = 'white';
    customization.resultScreenCustomization.resultAnimationBackgroundColor = 'var(--color-success)';
    customization.resultScreenCustomization.messageFont = 'var(--font-family-default)';
    // fonts
    customization.guidanceCustomization.buttonFont = 'var(--font-family-default)';
    customization.guidanceCustomization.headerFont = 'var(--font-family-default)';
    customization.guidanceCustomization.subtextFont = 'var(--font-family-default)';
    customization.guidanceCustomization.readyScreenHeaderFont = 'var(--font-family-default)';
    customization.guidanceCustomization.retryScreenHeaderFont = 'var(--font-family-default)';
    customization.guidanceCustomization.readyScreenSubtextFont = 'var(--font-family-default)';
    customization.guidanceCustomization.retryScreenSubtextFont = 'var(--font-family-default)';
    // retry screen
    customization.guidanceCustomization.retryScreenImageBorderColor = 'var(--color-ternary)';
    customization.guidanceCustomization.retryScreenImageCornerRadius = '0px';
    customization.guidanceCustomization.retryScreenOvalStrokeColor = 'var(--color-ternary)';
    // vocal guidance
    customization.vocalGuidanceCustomization.mode = FaceTecVocalGuidanceMode.NO_VOCAL_GUIDANCE;

    customization.enableCameraPermissionsHelpScreen = false;

    return customization;
  }
}
