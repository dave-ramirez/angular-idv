import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  Component,
  Prop
} from '@stencil/core';
import {
  getResourcesDirPath as globalGetResourcesDirPath
} from '../../global';
import { ButtonCloseTopRightCallbacks } from './button-close-top-right.model';

@Component({
  tag: 'button-close-top-right',
  styleUrl: 'button-close-top-right.css',
  shadow: false
})
export class ButtonCloseTopRightComponent {
  @Prop()
  isDisabled = false;
  @Prop()
  callbacks: ButtonCloseTopRightCallbacks;
  @Prop()
  size = '24px';
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
        class="button-close-top-right"
        onClick={ () => { this.onButtonClicked(); } }
      >
        { navigator.onLine && (
          <img
            src={ `${this.resourcesDir}icons/icon-close.svg` }
            alt="button-close-top-right"
            style={ {
              width: this.size,
              height: this.size
            } }
          />
        ) }
        { !navigator.onLine && ('Close') }
      </div>
    );
  }

  private onButtonClicked = () => {
    if (this.isDisabled) {
      return;
    }
    this.callbacks.onClick();
  };
}