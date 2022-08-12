import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  Component,
  Prop
} from '@stencil/core';

const DEFUALT_TEXT = 'Loading';
const DEFAULT_ICON_FONT_SIZE = '47px';

@Component({
  tag: 'processing-layer',
  styleUrl: 'processing-layer.css',
  shadow: true
})
export class LoadingLayerComponent {
  @Prop()
  text = DEFUALT_TEXT;
  @Prop()
  iconFontSize = DEFAULT_ICON_FONT_SIZE;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    return (
      <div class="processing-layer">
        <p class="icon">
          <icon-loader fontSize={ this.iconFontSize }></icon-loader>
        </p>
        <p class="text">{ this.text }</p>
      </div>
    );
  }
}