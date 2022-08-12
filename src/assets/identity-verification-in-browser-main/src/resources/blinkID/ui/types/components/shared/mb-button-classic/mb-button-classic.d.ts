/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */
import { EventEmitter } from '../../../stencil-public-runtime';
export declare class MbButtonClassic {
  /**
   * Set to 'true' if button should be disabled, and if click events should not be triggered.
   */
  disabled: boolean;
  /**
   * Set to 'true' if default event should be prevented.
   */
  preventDefault: boolean;
  /**
   * Event which is triggered when user clicks on button element. This event is not triggered
   * when the button is disabled.
   */
  buttonClick: EventEmitter<UIEvent>;
  /**
   * Host element as variable for manipulation
   */
  hostEl: HTMLElement;
  private handleClick;
  connectedCallback(): void;
  render(): any;
}
