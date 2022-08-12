import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  Component,
  Prop
} from '@stencil/core';
import {
  getResourcesDirPath as globalGetResourcesDirPath
} from '../../global';

const DEFAULT_FONT_SIZE = '12px';

@Component({
  tag: 'icon-loader',
  styleUrl: 'icon-loader.css'
})
export class IconLoaderComponent {
  @Prop()
  fontSize?: string;

  private resourcesDirPath: string;

  /* Lifecycle */
  componentWillLoad(): void {
    this.resourcesDirPath = globalGetResourcesDirPath();
  }

  /* Lifecycle */
  render() { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    const fontSize = this.fontSize || DEFAULT_FONT_SIZE;

    return (
      <img
        class="icon-loader-component"
        style={
          {
            height: fontSize,
            width: 'auto'
          }
        }
        src={ `${this.resourcesDirPath}icons/icon-loader.svg` }
        alt="icon-loader"
      />
    );
  }
}