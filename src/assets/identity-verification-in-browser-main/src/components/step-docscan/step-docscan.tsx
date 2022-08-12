import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  Component,
  Method,
  Prop
} from '@stencil/core';
import {
  getLicense as globalGetLicense,
  getDocscanSkipUnsupportedBack as globalGetDocscanSkipUnsupportedBack,
  getResourcesDirPath as globalGetResourcesDirPath
} from '../../global';
import {
  StepComponent,
  StepComponentCallbacks,
  StepComponentConfig,
  StepTerminatingError
} from '../../shared';
import { BlinkIdDocscanFinishData } from '../blinkid-docscan/blinkid-docscan.model';

/**
 * Document scan step.
 *
 * Implements StepComponent interface - demands unified controls over one step that is part
 * of the Identity Verification flow.
 */
@Component({
  tag: 'step-docscan',
  shadow: true
})
export class StepDocScanComponent implements StepComponent {
  @Prop()
  config!: StepComponentConfig;
  @Method()
  async start(skipLobby?: boolean): Promise<void> {
    if (this.docScanResult) {
      await this.blinkIdDocScanElement.reviewScan();
    } else {
      await this.blinkIdDocScanElement.startScan(skipLobby);
    }
  }
  @Method()
  async restart(skipLobby?: boolean): Promise<void> {
    await this.reset();
    await this.start(skipLobby);
  }
  @Method()
  async reset(): Promise<void> {
    await this.blinkIdDocScanElement.reset();
    this.docScanResult = null;
  }
  @Method()
  async didSucceed(): Promise<boolean> {
    return this.docScanResult != null;
  }
  @Method()
  async getSuccessData(): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    return this.docScanResult;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private docScanResult: any;
  private callbacks: StepComponentCallbacks;
  private blinkIdDocScanElement: HTMLBlinkidDocscanElement;

  /* Lifecycle */
  componentWillRender(): void {
    this.callbacks = this.config.callbacks;
  }

  /* Lifecycle */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    return (
      <blinkid-docscan
        hasLobby= { this.config.hasLobby }
        config={ {
          blinkidLicence: globalGetLicense(),
          resourcesDirPath: globalGetResourcesDirPath(),
          skipUnsupportedBack: globalGetDocscanSkipUnsupportedBack(),
          callbacks: {
            onLoadDone: () => {
              this.callbacks.onLoadDone?.();
            },
            onStart: () => {
              this.callbacks.onStart();
            },
            onStartDone: () => {
              this.callbacks.onStartDone();
            },
            onFinish: (data?: BlinkIdDocscanFinishData) => {
              if (data?.success) {
                this.docScanResult = { ...data.success };
                this.callbacks.onFinish(this.docScanResult);
                return;
              }
              if (data?.error) {
                this.callbacks.onTerminatingError(data.error as StepTerminatingError);
                return;
              }

              // close
              this.callbacks.onFinish();
            },
            onNetworkProblems: () => {
              this.callbacks.onNetworkProblems();
            }
          }
        } }
        ref={ (el: HTMLBlinkidDocscanElement) => { this.blinkIdDocScanElement = el; } }
      ></blinkid-docscan>
    );
  }
}
