import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  Component,
  Prop
} from '@stencil/core';
import { ButtonIcon, ButtonIconRoundCallbacks } from './button-icon-round.model';

@Component({
  tag: 'button-icon-round',
  styleUrl: 'button-icon-round.css',
  shadow: true
})
export class ButtonIconRoundComponent {
  @Prop()
  icon!: ButtonIcon;
  @Prop()
  size = 36;
  @Prop()
  marginTop = '0px';
  @Prop()
  marginRight = '0px';
  @Prop()
  marginBottom = '0px';
  @Prop()
  marginLeft = '0px';
  @Prop()
  callbacks?: ButtonIconRoundCallbacks;
  @Prop()
  isDisabled = false;

  /* Lifecycle */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    return (
      <a
        class={ {
          'button-icon-round': true,
          'disabled': this.isDisabled
        } }
        style={ {
          width: `${this.size}px`,
          height: `${this.size}px`,
          marginTop: this.marginTop,
          marginRight: this.marginRight,
          marginBottom: this.marginBottom,
          marginLeft: this.marginLeft,
        } }
        href="javascript:void(0)"
        onClick={ () => {
          if (this.isDisabled) { return; }
          this.callbacks?.onClick?.();
        } }
      >
        { this.icon === ButtonIcon.Camera && (
          <svg width={ this.size } height={ this.size } viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="background" d="M0 18C0 8.05888 8.05888 0 18 0C27.9411 0 36 8.05888 36 18C36 27.9411 27.9411 36 18 36C8.05888 36 0 27.9411 0 18Z"/>
            <path class="icon" d="M10.9882 14.3214C10.6756 14.634 10.5 15.0579 10.5 15.4999V22.9999C10.5 23.4419 10.6756 23.8659 10.9882 24.1784C11.3007 24.491 11.7246 24.6666 12.1667 24.6666H23.8333C24.2754 24.6666 24.6993 24.491 25.0118 24.1784C25.3244 23.8659 25.5 23.4419 25.5 22.9999V15.4999C25.5 15.0579 25.3244 14.634 25.0118 14.3214C24.6993 14.0088 24.2754 13.8333 23.8333 13.8333H23.0583C22.784 13.8333 22.5139 13.7656 22.272 13.6362C22.0301 13.5069 21.8239 13.3198 21.6717 13.0916L20.995 12.0749C20.8428 11.8467 20.6365 11.6596 20.3946 11.5303C20.1527 11.4009 19.8827 11.3332 19.6083 11.3333H16.3917C16.1173 11.3332 15.8473 11.4009 15.6054 11.5303C15.3635 11.6596 15.1572 11.8467 15.005 12.0749L14.3283 13.0916C14.1761 13.3198 13.9699 13.5069 13.728 13.6362C13.4861 13.7656 13.216 13.8333 12.9417 13.8333H12.1667C11.7246 13.8333 11.3007 14.0088 10.9882 14.3214Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path class="icon" d="M19.7678 20.601C20.2366 20.1322 20.5 19.4963 20.5 18.8333C20.5 18.1702 20.2366 17.5343 19.7678 17.0655C19.2989 16.5966 18.663 16.3333 18 16.3333C17.337 16.3333 16.7011 16.5966 16.2322 17.0655C15.7634 17.5343 15.5 18.1702 15.5 18.8333C15.5 19.4963 15.7634 20.1322 16.2322 20.601C16.7011 21.0699 17.337 21.3333 18 21.3333C18.663 21.3333 19.2989 21.0699 19.7678 20.601Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        ) }
        { this.icon === ButtonIcon.Image && (
          <svg width={ this.size } height={ this.size } viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="background" d="M0 18C0 8.05888 8.05888 0 18 0C27.9411 0 36 8.05888 36 18C36 27.9411 27.9411 36 18 36C8.05888 36 0 27.9411 0 18Z"/>
            <path class="icon" d="M11.3333 21.3333L15.155 17.5116C15.4675 17.1992 15.8914 17.0237 16.3333 17.0237C16.7753 17.0237 17.1991 17.1992 17.5116 17.5116L21.3333 21.3333M19.6666 19.6666L20.9883 18.345C21.3009 18.0325 21.7247 17.857 22.1666 17.857C22.6086 17.857 23.0324 18.0325 23.345 18.345L24.6666 19.6666M19.6666 14.6666H19.675M13 24.6666H23C23.442 24.6666 23.8659 24.4911 24.1785 24.1785C24.4911 23.8659 24.6666 23.442 24.6666 23V13C24.6666 12.558 24.4911 12.134 24.1785 11.8215C23.8659 11.5089 23.442 11.3333 23 11.3333H13C12.558 11.3333 12.134 11.5089 11.8215 11.8215C11.5089 12.134 11.3333 12.558 11.3333 13V23C11.3333 23.442 11.5089 23.8659 11.8215 24.1785C12.134 24.4911 12.558 24.6666 13 24.6666Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        ) }
      </a>
    );
  }
}
