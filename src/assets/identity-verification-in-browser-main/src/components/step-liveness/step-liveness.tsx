import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  Component,
  Method,
  Prop
} from '@stencil/core';
import { getResourcesDirPath as globalGetResourcesDirPath } from '../../global';
import {
  StepComponent,
  StepComponentCallbacks,
  StepComponentConfig
} from '../../shared';
import {
  FaceTecLivenessFinishData
} from '../facetec-liveness/facetec-liveness.model';

/**
 * Livenes check step.
 *
 * Implements StepComponent interface - demands unified controls over one step that is part
 * of the Identity Verification flow.
 */
@Component({
  tag: 'step-liveness',
  shadow: true
})
export class StepLivenessComponent implements StepComponent {
  @Prop()
  config!: StepComponentConfig;
  @Method()
  async start(skipLobby?: boolean): Promise<void> {
    this.callbacks.onStart();

    if (!this.facetecLivenessResult) {
      await this.facetecLivenessElement.enroll(skipLobby);
    }
  }
  @Method()
  async restart(skipLobby?: boolean): Promise<void> {
    await this.reset();
    await this.start(skipLobby);
  }
  @Method()
  async reset(): Promise<void> {
    this.facetecLivenessElement.reset();
    this.resetProcessingVars();
  }
  @Method()
  async didSucceed(): Promise<boolean> {
    return this.facetecLivenessResult != null;
  }
  @Method()
  async getSuccessData(): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    return this.facetecLivenessResult;
  }

  private resourcesDirPath: string;
  private callbacks: StepComponentCallbacks;
  private facetecLivenessElement: HTMLFacetecLivenessElement;
  private facetecLivenessResult: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor() {
    this.resetProcessingVars();
  }

  private resetProcessingVars = (): void => {
    this.facetecLivenessResult = null;
  };

  /* Lifecycle */
  componentWillLoad(): void {
    this.resourcesDirPath = globalGetResourcesDirPath();
  }

  /* Lifecycle */
  componentWillRender(): void {
    this.callbacks = this.config.callbacks;
  }

  /* Lifecycle */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    return (
      <facetec-liveness
        hasLobby={ this.config.hasLobby }
        config={ {
          resourcesDirPath: this.resourcesDirPath,
          callbacks: {
            onLoadDone: () => { this.callbacks.onLoadDone?.(); },
            onStart: () => { this.callbacks.onStart(); },
            onStartDone: () => { this.callbacks.onStartDone(); },
            onFinish: (data?: FaceTecLivenessFinishData) => {
              if (data?.success) {
                this.facetecLivenessResult = data.success;
                this.callbacks.onFinish?.(data.success);
                return;
              }
              if (data?.error) {
                this.callbacks.onTerminatingError('ERROR');
                return;
              }

              // close
              this.callbacks.onFinish?.();
            },
            onNetworkProblems: () => {
              this.callbacks.onNetworkProblems();
            },
          }
        } }
        ref={ (el: HTMLFacetecLivenessElement) => { this.facetecLivenessElement = el; } }
      ></facetec-liveness>
    );
  }
}