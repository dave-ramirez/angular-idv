import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  Component,
  Method,
  Prop,
  State,
  FunctionalComponent
} from '@stencil/core';
import { FlowManager, FlowManagerStep, FlowManagerStepLabels } from '../../flowManager';
import { StepComponent, StepComponentConfig, StepTerminatingError } from '../../shared';
import { IDVStepName } from '../../shared';
import {
  FlowManagerComponentCallbacks,
  FlowState,
  VerificationResult
} from './flow-manager.model';
import { FmptCheckpoint } from './flow-manager-progress-tracker.model';
import {
  getResourcesDirPath as globalGetResourcesDirPath
} from '../../global';
import { VerifyServerApiClient } from '../../utils/verify-server.utils';
import { buildJpgDataUrlFromBase64 } from '../../utils/image.utils';
import { consoleError } from '../../utils/logging.utils';

@Component({
  tag: 'flow-manager',
  styleUrl: 'flow-manager.css',
  shadow: true
})
export class FlowManagerComponent {
  @State()
  flowState: FlowState;
  @State()
  verificationResult: VerificationResult;
  @State()
  inProgress: boolean;
  @State()
  prepareNewSessionInProgress: boolean;
  @State()
  startingStepInProgress: boolean;
  @State()
  verificationInProgress: boolean;
  @State()
  checkpoints: FmptCheckpoint[];
  @State()
  currentStepLabels: FlowManagerStepLabels;
  @State()
  isEndReached: boolean;
  @State()
  networkTroubleshootInProgress: boolean;
  @Prop()
  steps!: IDVStepName[];
  @Prop()
  callbacks!: FlowManagerComponentCallbacks;
  @Method()
  async start(): Promise<void> {
    if (this.inProgress || this.isEndReached) {
      return;
    }

    this.inProgress = true;

    await this.prepareSession();

    this.flowManager.startCurrentStep(true);
    this.getCurrentStepLabels();
  }
  @Method()
  async reset(): Promise<void> {
    this.resetProcessingVars();
    await this.flowManager.reset();
    this.rerenderCheckpoints();
  }
  //
  private flowManager: FlowManager;
  private isSessionPrepared: boolean;
  private verificationResultUserName: string;
  private verificationResultUserImage: string;

  constructor() {
    this.resetProcessingVars();
  }

  /* Lifecycle */
  componentWillLoad(): void {
    this.initializeFlowManager();
    this.rerenderCheckpoints();
  }

  private resetProcessingVars = () => {
    this.flowState = 'INITIAL';
    this.verificationResult = null;
    this.verificationResultUserName = null;
    this.verificationResultUserImage = null;
    this.inProgress = false;
    this.isSessionPrepared = false;
    this.prepareNewSessionInProgress = false;
    this.startingStepInProgress = false;
    this.verificationInProgress = false;
    this.isEndReached = false;
    this.networkTroubleshootInProgress = false;
  };

  /* Lifecycle */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    return (
      <div
        class={ {
          'flow-manager': true,
          'show': this.inProgress
        } }
      >
        <button-close-top-right
          isDisabled={ this.areInputsDisabled() }
          callbacks={ { onClick: () => { this.onCloseClicked(); } } }
        ></button-close-top-right>
        <FlowManagerInfo labels={ this.currentStepLabels }></FlowManagerInfo>
        { this.flowManager.steps.map((step) => step.componentJSX) }
        <VerificationResultLayer
          show={ this.inProgress && this.flowState === 'FINISHED' }
          result={ this.verificationResult }
          endUserImageDataUrl={ this.verificationResultUserImage }
          endUserName={ this.verificationResultUserName }
          callbacks={ {
            onClose: () => { this.onCloseClicked(); },
            onDone: () => { this.onCloseClicked(); }
          } }
        ></VerificationResultLayer>
        <ErrorLayer
          show={ this.inProgress && this.isFlowErrorState() }
          message={ (() => {
            if (
              this.flowState === 'ERROR_NETWORK_SESSION'
              || this.flowState === 'ERROR_NETWORK_VERIFICATION'
            ) {
              return 'There was a problem with your network. Check your data or wifi connection.';
            }
            if (this.flowState === 'ERROR_CONFIG') {
              return 'Verification not available.';
            }
            return 'Something went wrong.';
          })() }
          buttonText={ (() => {
            if (this.flowState === 'ERROR_CONFIG' || this.flowState === 'ERROR') {
              return 'Done';
            }
            return 'Retry';
          })() }
          callbacks={ {
            onClose: () => {
              /*
                This actually means that end user rejects any help.
                Action: reset everything, close everything and emit error to parent.
              */
              const saveFlowState = this.flowState;
              this.flowManager.reset().then(() => {
                this.flowState = saveFlowState;
                this.close();
              });
            },
            onAction: () => {
              if (this.flowState === 'ERROR_NETWORK_SESSION') {
                this.flowState = 'IN_PROGRESS';
                this.prepareSession();
                return;
              }
              if (this.flowState === 'ERROR_NETWORK_VERIFICATION') {
                this.flowState = 'IN_PROGRESS';
                this.verify();
                return;
              }
              if (this.flowState === 'ERROR_CONFIG' || this.flowState === 'ERROR') {
                this.close();
                return;
              }
            }
          } }
        ></ErrorLayer>
        <NetworkTroubleshootLayer
          show={ this.inProgress && this.flowState === 'ERROR_NETWORK_OTHER' }
          troubleshootInProgress={ this.networkTroubleshootInProgress }
          callbacks={ {
            onClose: () => {
              /*
                This actually means that end user rejects any help.
                Action: reset everything, close everything and emit error to parent.
              */
              const saveFlowState = this.flowState;
              this.flowManager.reset().then(() => {
                this.flowState = saveFlowState;
                this.close();
              });
            },
            onAction: () => {
              if (this.networkTroubleshootInProgress) { return; }
              this.networkTroubleshootInProgress = true;
              setTimeout(() => {
                if (navigator.onLine) {
                  this.flowState = 'IN_PROGRESS';
                }
                this.networkTroubleshootInProgress = false;
              }, 1000);
            },
          } }
        ></NetworkTroubleshootLayer>
        <WatermarkBarBottom></WatermarkBarBottom>
        <flow-manager-progress-tracker
          show={ this.inProgress }
          checkpoints={ this.checkpoints }
        ></flow-manager-progress-tracker>
        { (this.prepareNewSessionInProgress || this.verificationInProgress) && (<processing-layer></processing-layer>) }
      </div>
    );
  }

  private isFlowErrorState = (): boolean => {
    return this.flowState === 'ERROR' || this.flowState === 'ERROR_CONFIG'
      || this.flowState === 'ERROR_NETWORK_SESSION'
      || this.flowState === 'ERROR_NETWORK_VERIFICATION';
  }

  private areInputsDisabled = (): boolean => {
    return this.prepareNewSessionInProgress || this.startingStepInProgress || this.verificationInProgress;
  };

  private onCloseClicked = () => {
    if (this.areInputsDisabled()) {
      return;
    }

    this.close();
  };

  private close = () => {
    this.callbacks.onClose(this.flowState, this.verificationResult);
    this.inProgress = false;
  };

  private prepareSession = async (): Promise<void> => {
    if (this.isSessionPrepared) { return; }

    this.flowState = 'IN_PROGRESS';

    this.prepareNewSessionInProgress = true;

    try {
      const result = await VerifyServerApiClient.beginVerifySession({ steps: this.steps });
      const { token } = result.vs;

      // token is more comprehensive and is used as a session token
      this.callbacks.onSessionInitialized(token);

      this.isSessionPrepared = true;
    } catch (err) {
      consoleError('begin session error');
      if (navigator.onLine) {
        this.flowState = 'ERROR';
      } else {
        this.flowState = 'ERROR_NETWORK_SESSION';
      }
    }

    this.prepareNewSessionInProgress = false;
  }

  private initializeFlowManager = (): void => {
    this.flowManager = new FlowManager();

    this.steps.forEach((step, index) => {
      if (step === IDVStepName.DOCUMENT_SCANNING) {
        this.addFlowManagerStep_DOCUMENT_SCANNING(this.flowManager, index);
      }
      else if (step === IDVStepName.FACETEC_LIVENESS) {
        this.addFlowManagerStep_FACETEC_LIVENESS(this.flowManager, index);
      }
    });
  }

  private addFlowManagerStep_DOCUMENT_SCANNING = (
    flowManager: FlowManager,
    stepIndex: number
  ): void => {
    const stepConfig: StepComponentConfig = {
      hasLobby: true,
      callbacks: {
        onLoadDone: () => {
          this.flowManager.steps[stepIndex].setAsLoaded();
          this.checkAndHandleIfAllStepsLoaded(); // async
        },
        onStart: () => {
          this.startingStepInProgress = true;
        },
        onStartDone: () => {
          this.startingStepInProgress = false;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onFinish: (successData?: any) => {
          if (successData != null) {
            this.handleOnStepSuccess(successData);
          }
        },
        onTerminatingError: (error: StepTerminatingError) => {
          if (error === 'ERROR_LICENSE') {
            this.flowState = 'ERROR_CONFIG';
          } else {
            this.flowState = 'ERROR';
          }

          this.close();
        },
        onNetworkProblems: () => {
          consoleError('network problems detected (1)');
          // sub-components handle network errors for themself
          // this.flowState = 'ERROR_NETWORK_OTHER';
        },
      }
    };
    flowManager.addStep(
      IDVStepName.DOCUMENT_SCANNING,
      {
        text: 'Scan your ID',
        subText: 'Go grab one of your identity documents or upload a photo from the gallery. No nudes.',
        checkpoint: {
          future: { text: 'Scan your ID', subText: 'Go grab one of your identity documents.' },
          current: { text: 'Scan your ID', subText: 'Go grab one of your identity documents.' },
          past: { text: 'ID Scanned', subText: 'Well  done, moving on.' }
        },
      },
      <step-docscan
        config={ stepConfig }
        ref={ (el: StepComponent) => { this.flowManager.steps[stepIndex].setComponent(el); }}
      ></step-docscan>,
      { needsLoading: true }
    );
  };

  private addFlowManagerStep_FACETEC_LIVENESS = (
    flowManager: FlowManager,
    stepIndex: number
  ): void => {
    const stepConfig: StepComponentConfig = {
      hasLobby: true,
      callbacks: {
        onLoadDone: () => {
          this.flowManager.steps[stepIndex].setAsLoaded();
          this.checkAndHandleIfAllStepsLoaded(); // async
        },
        onStart: () => {
          this.startingStepInProgress = true;
        },
        onStartDone: () => {
          this.startingStepInProgress = false;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onFinish: (successData?: any) => {
          if (successData != null) {
            this.handleOnStepSuccess(successData);
          }
        },
        onTerminatingError: (error: StepTerminatingError) => {
          if (error === 'ERROR_LICENSE') {
            this.flowState = 'ERROR_CONFIG';
          } else {
            this.flowState = 'ERROR';
          }

          this.close();
        },
        onNetworkProblems: () => {
          consoleError('network problems detected (2)');
          // sub-components handle network errors for themself
          // this.flowState = 'ERROR_NETWORK_OTHER';
        },
      }
    };
    flowManager.addStep(
      IDVStepName.FACETEC_LIVENESS,
      {
        text: 'Take a selfie',
        subText: 'Watch out for poor lightning and keep a straight face. Taking a selfie is serious business.',
        checkpoint: {
          future: { text: 'Take a selfie', subText: 'Ensure your face is well-lit.' },
          current: { text: 'Take a selfie', subText: 'Ensure your face is well-lit.' },
          past: { text: 'Selfie confirmed', subText: 'Looking great today.' }
        },
      },
      <step-liveness
        config={ stepConfig }
        ref={ (el: StepComponent) => { this.flowManager.steps[stepIndex].setComponent(el); }}
      ></step-liveness>,
      { needsLoading: true }
    );
  }

  private checkAndHandleIfAllStepsLoaded = async (): Promise<void> => {
    const allLoaded = this.flowManager.stepsLoaded();
    if (allLoaded) {
      this.callbacks.onLoaded();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleOnStepSuccess = async (currentStepSuccessData: any): Promise<void> => {
    await this.flowManager.next(currentStepSuccessData);
    this.rerenderCheckpoints();
    this.isEndReached = this.flowManager.isEndReached(); // has to be second
    if (!this.isEndReached) {
      this.flowManager.startCurrentStep(true);
      this.getCurrentStepLabels();
    }
    else {
      setTimeout(
        () => { this.verify(); },
        100
      );
    }
  }

  private rerenderCheckpoints = (): void => {
    // add regular steps
    const newCheckpoints: FmptCheckpoint[] = this.flowManager.steps.map((fmStep: FlowManagerStep) => ({
      name: fmStep.name,
      ...fmStep.getCheckpointLabels(),
      status: fmStep.status
    }));

    this.checkpoints = newCheckpoints;
  };

  private getCurrentStepLabels = (): void => {
    this.currentStepLabels = this.flowManager.getCurrentStepLabels();
  };


  private verify = async (): Promise<void> => {
    if (!this.isEndReached) {
      return;
    }

    this.verificationInProgress = true;

    try {
      const result = await VerifyServerApiClient.verification();

      this.verificationResultUserName = this.extractEndUserName();
      this.verificationResultUserImage = this.extractEndUserImage();
      this.flowState = 'FINISHED';
      this.verificationResult = result.verificationStatus;
    } catch(err) {
      consoleError('verification error');
      if (navigator.onLine) {
        this.flowState = 'ERROR';
      } else {
        this.flowState = 'ERROR_NETWORK_VERIFICATION';
      }
    }

    this.verificationInProgress = false;
  };

  private extractEndUserName = (): string => {
    const docscanStep = this.flowManager.steps.find(step => step.name === IDVStepName.DOCUMENT_SCANNING);
    if (docscanStep) {
      const successData = docscanStep.getSuccessData();
      return successData.originalData.firstName;
    }

    return '-';
  };

  private extractEndUserImage = (): string => {
    const faceTecStep = this.flowManager.steps.find(step => step.name === IDVStepName.FACETEC_LIVENESS);
    if (faceTecStep) {
      return buildJpgDataUrlFromBase64(faceTecStep.getSuccessData().faceTecUserImageBase64);
    }

    return '-';
  };
}

interface FlowManagerInfoProps {
  labels: FlowManagerStepLabels;
}

const FlowManagerInfo = (
  props: FlowManagerInfoProps
): FunctionalComponent<FlowManagerInfoProps> => {
  const resourcesDirPath = globalGetResourcesDirPath();
  if (props.labels) {
    return (
      <div class="flow-manager-info">
        <div class="general">
          <div class="content">
            <p class="head">
              IDENTITY VERIFICATION
            </p>
            <p class="title">
              Verify your identity in just 2 steps
            </p>
            <p class="subtitle">
              We will need a photo of your ID document and a nice selfie. This will only take a few minutes.
            </p>
          </div>
          {/* 210 height image */}
          <img
            class="d-none d-md-block"
            src={ `${resourcesDirPath}images/identity-verification.png` }
            alt="identity-verification"
          />
        </div>
        <div class="step">
          <p class="title">
            { props.labels.text }
          </p>
          <p class="subtitle">
            { props.labels.subText }
          </p>
        </div>
      </div>
    );
  }

  return null;
};

interface VerificationResultLayerProps {
  show: boolean;
  result: VerificationResult,
  endUserName?: string;
  endUserImageDataUrl?: string;
  callbacks: {
    onClose: () => void;
    onDone: () => void;
  }
}

const VerificationResultLayer = (
  props: VerificationResultLayerProps
): FunctionalComponent<VerificationResultLayerProps> => {
  const { result, endUserName, endUserImageDataUrl } = props;

  // TODO: check if these can be extracted somewhere
  const verifiedText = `Dear ${endUserName}, thank you for proving your identity - it was you all along!`;
  const verifiedGuidance = 'After you press done you will be directed to the main page.';
  const verifiedButtonText = 'Done';
  const notVerifiedText = 'Sorry we couldn\'t verify your identity';
  const notVerifiedGuidance = null;
  const notVerifiedButtonText = 'Done';
  const needsReviewText = `Dear ${endUserName}, thank you, that's all we need to verify your identity. You'll get notified when we're done.`;
  const needsReviewGuidance = 'After you press done you will be directed to the main page.';
  const needsReviewButtonText = 'Done';

  let text: string;
  let guidance: string;
  let buttonText: string;
  if (result === 'VERIFIED') {
    text = verifiedText;
    guidance = verifiedGuidance;
    buttonText = verifiedButtonText;
  }
  else if (result === 'NOT_VERIFIED') {
    text = notVerifiedText;
    guidance = notVerifiedGuidance;
    buttonText = notVerifiedButtonText;
  }
  else {
    text = needsReviewText;
    guidance = needsReviewGuidance;
    buttonText = needsReviewButtonText;
  }

  return (
    <div
      class={ {
        'verification-result-layer': true,
        'visible': props.show
      } }
    >
      <button-close-top-right
        callbacks={ {
          onClick: () => { props.callbacks.onClose(); }
        } }
      ></button-close-top-right>
      <div class="content">
        {/* Image */}
        { (result === 'VERIFIED' || result === 'NEEDS_REVIEW') && endUserImageDataUrl != null && (
          <p class="image">
            <img
              class={ {
                'verified': result === 'VERIFIED',
                'needs-review': result === 'NEEDS_REVIEW'
              } }
              src={ endUserImageDataUrl }
              alt="endUserImageDataUrl"
            />
          </p>
        ) }
        { result === 'NOT_VERIFIED' && (
          <p class="image">
            <icon-fail-circle></icon-fail-circle>
          </p>
        ) }
        {/* Result */}
        <p class="result">{ text }</p>
        {/* Guidance */}
        { guidance && (<p class="guidance">{ guidance } </p>) }
        {/* Button */}
        <p class="buttons">
          <button
            class="primary"
            onClick={ () => {
              props.callbacks.onDone();
            } }
          >
            { buttonText }
          </button>
        </p>
      </div>
    </div>
  );
};

interface ErrorLayerProps {
  show: boolean;
  message: string;
  callbacks: {
    onClose: () => void,
    onAction: () => void
  };
  buttonText?: string;
}

const ErrorLayer = (props: ErrorLayerProps): FunctionalComponent<ErrorLayerProps> => {
  const buttonText = props.buttonText || 'Retry';
  return (
    <div
      class={ {
        'error-layer': true,
        'visible': props.show
      } }
    >
      <button-close-top-right
        callbacks={ {
          onClick: () => { props.callbacks.onClose(); }
        } }
      ></button-close-top-right>
      <div class="content">
        { navigator.onLine && (
          <p class="icon">
            <icon-fail-circle></icon-fail-circle>
          </p>
        ) }
        <p class="message">
          { props.message }
        </p>
        <p class="button">
          <button
            class="primary"
            onClick={ () => { props.callbacks.onAction(); } }
          >{ buttonText }</button>
        </p>
      </div>
    </div>
  );
};

interface NetworkTroubleshootLayerProps {
  show: boolean;
  troubleshootInProgress: boolean;
  callbacks: {
    onClose: () => void,
    onAction: () => void;
  };
}

const NetworkTroubleshootLayer = (
  props: NetworkTroubleshootLayerProps
): FunctionalComponent<NetworkTroubleshootLayerProps> => {

  return (
    <div
      class={ {
        'error-layer': true,
        'visible': props.show
      } }
    >
      <button-close-top-right
        isDisabled={ props.troubleshootInProgress }
        callbacks={ {
          onClick: () => { props.callbacks.onClose(); }
        } }
      ></button-close-top-right>
      <div class="content">
        <p class="message">
          There was a problem with your network. Check your data or wifi connection.
        </p>
        <p class="button">
          <button
            disabled={ props.troubleshootInProgress }
            class="primary"
            onClick={ () => { props.callbacks.onAction(); } }
          >
            { !props.troubleshootInProgress && 'Troubleshoot'}
            { props.troubleshootInProgress && 'Troubleshooting...'}
          </button>
        </p>
      </div>
    </div>
  );
};

const WatermarkBarBottom: FunctionalComponent = () => {
  return (
    <div class="watermark-bar-bottom">
      <p>
        Powered by<br/>
        MICROBLINK
      </p>
    </div>
  );
};
