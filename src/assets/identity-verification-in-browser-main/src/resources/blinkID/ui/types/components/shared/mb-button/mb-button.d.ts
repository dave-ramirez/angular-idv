/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */
import { EventEmitter } from '../../../stencil-public-runtime';
import { TranslationService } from '../../../utils/translation.service';
export declare class MbButton {
  /**
   * Set to 'true' if button should be disabled, and if click events should not be triggered.
   */
  disabled: boolean;
  /**
   * Set to 'true' if button contains an icon.
   */
  icon: boolean;
  /**
   * Set to 'true' if default event should be prevented.
   */
  preventDefault: boolean;
  /**
   * Set to 'true' if button should be visible.
   */
  visible: boolean;
  /**
   * Set to 'true' if button should enter 'selected' state.
   */
  selected: boolean;
  /**
   * Passed image from parent component.
   */
  imageSrcDefault: string;
  /**
   * Passed image from parent component.
   */
  imageSrcActive: string;
  /**
   * Passed description text for image element from parent component.
   */
  imageAlt: string;
  /**
   * Set to string which should be displayed below the icon.
   *
   * If omitted, nothing will show.
   */
  label: string;
  /**
   * Instance of TranslationService passed from root component.
   */
  translationService: TranslationService;
  imageSrc: string;
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
  private handleMouseOver;
  private handleMouseOut;
  connectedCallback(): void;
  render(): any;
}
