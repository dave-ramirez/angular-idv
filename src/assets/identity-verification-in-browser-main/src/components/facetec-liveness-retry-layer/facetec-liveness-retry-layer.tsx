import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  Component,
  Prop,
  Event,
  EventEmitter
} from '@stencil/core';
import { FaceTecConnectorResult } from '../../utils/faceTecConnector';

@Component({
  tag: 'facetec-liveness-retry-layer',
  styleUrl: 'facetec-liveness-retry-layer.css',
  shadow: true
})
export class FacetecRetryLayerComponent {
  @Prop()
  show!: boolean;
  @Prop()
  errorCode: FaceTecConnectorResult;
  @Event()
  yes: EventEmitter;
  @Event()
  no: EventEmitter;

  /* Lifecycle */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    let message: string;

    if (this.errorCode === FaceTecConnectorResult.NETWORK_ERROR) {
      message = 'Your session was interrupted. Please retry.';
    }
    else if (this.errorCode === FaceTecConnectorResult.SESSION_TIMEOUT) {
      message = 'Your session has expired.';
    }
    else if (this.errorCode === FaceTecConnectorResult.NOT_VERIFIED) {
      message = 'Sorry, we couldn\'t verify your identity.';
    }
    else if (this.errorCode === FaceTecConnectorResult.UNKNOWN_ERROR) {
      message = 'Sorry, we couldn\'t verify your identity.';
    }
    else if (this.errorCode === FaceTecConnectorResult.LOCKED_OUT) {
      message = 'Too many failed attempts. Try again in 5 minutes.';
    }
    else if (this.errorCode === FaceTecConnectorResult.CONFIG_KEYS_ERROR) {
      message = 'Verification not available.';
    }
    else if (this.errorCode === FaceTecConnectorResult.CAMERA_ERROR) {
      message = 'Your camera is used by another App. Close the other App and try again.';
    }
    else {
      message = 'Something went wrong.';
    }

    return(
      <div
        class={ {
          'facetec-retry-layer': true,
          'visible': this.show
        } }
      >
        <div class="content">
          <button-close-top-right
            callbacks={ { onClick: () => { this.no.emit(); } } }
          ></button-close-top-right>
          <p class="section">
            <icon-fail-circle></icon-fail-circle>
          </p>
          <p class="section">
            { message }
            {/* TODO: remove this later on */}
            { this.errorCode != null && (<br />) }
            { this.errorCode != null && (`(facetec error: ${this.errorCode})`) }
            {/* */}
          </p>
          <p class="section last">
            <button
              class="primary"
              onClick={ () => { this.yes.emit(); }}
            >Try Again</button>
          </p>
        </div>
      </div>
    );
  }
}