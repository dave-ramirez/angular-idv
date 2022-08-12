import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  Component,
  Prop
} from '@stencil/core';
import { getResourcesDirPath as globalGetResourcesDirPath } from '../../global';
import { IconFailCircleSize } from './icon-fail-circle.model';

@Component({
  tag: 'icon-fail-circle',
  styleUrl: 'icon-fail-circle.css',
  shadow: true
})
export class IconFailCircleComponent {
  @Prop()
  size: IconFailCircleSize = 'large';
  private resourcesDirPath: string;

  /* Lifecycle */
  componentWillLoad(): void {
    this.resourcesDirPath = globalGetResourcesDirPath();
  }

  /* Lifecycle */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    return(
      <img
        class={ {
          'icon-fail-circle': true,
          [this.size]: true
        } }
        src={ `${this.resourcesDirPath}icons/icon-fail-circle.svg` }
        alt="icon-fail-white"
      />
    );
  }
}
