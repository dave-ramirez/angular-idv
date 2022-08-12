import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  Component,
  Prop
} from '@stencil/core';
import {
  getResourcesDirPath as globalGetResourcesDirPath
} from '../../global';
import { FmptCheckpoint } from './flow-manager-progress-tracker.model';

@Component({
  tag: 'flow-manager-progress-tracker',
  styleUrl: 'flow-manager-progress-tracker.css',
  shadow: false
})
export class FlowManagerProgressTrackerComponent {
  @Prop()
  show!: boolean;
  @Prop()
  checkpoints!: FmptCheckpoint[];

  private resourcesDir: string;

  /* Lifecycle */
  componentWillLoad(): void {
    this.resourcesDir = globalGetResourcesDirPath();
  }

  /* Lifecycle */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    return (
      <div
        class={ {
          'flow-manager-progress-tracker': true,
          'show': this.show
        } }
      >
        { this.checkpoints.map((checkpoint, index) => (
          <div
            class={ {
              'checkpoint': true,
              [checkpoint.status]: true
            } }
            key={ checkpoint.name }
          >
            <div class="content">
              {/* Icon */}
              <div class="icon-container">
                {/* Current */}
                { checkpoint.status === 'current' && (
                  <div class="icon">{ index + 1 }</div>
                ) }
                {/* Past */}
                { checkpoint.status === 'past' && (
                  <img
                    class="icon"
                    src={ `${this.resourcesDir}icons/icon-success-circle.svg` }
                    alt={ `checkpoint-link${ index + 1}` }
                  />
                ) }
                {/* Future */}
                { checkpoint.status === 'future' && (
                  <div class="icon">{ index + 1 }</div>
                ) }
              </div>
              {/* Info */}
              <div class="info">
                <p class="text">{ checkpoint.text }</p>
                <p class="sub-text d-none d-md-block">{ checkpoint.subText }</p>
              </div>
            </div>
            { index < (this.checkpoints.length - 1) && (<div class="arrow-part"></div>) }
          </div>
        )) }
      </div>
    );
  }
}
