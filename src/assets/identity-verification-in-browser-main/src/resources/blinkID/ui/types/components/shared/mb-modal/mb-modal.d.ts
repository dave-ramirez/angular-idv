/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */
import { EventEmitter } from '../../../stencil-public-runtime';
export declare class MbModal {
  /**
   * Show modal content
   */
  visible: boolean;
  /**
   * Passed title content from parent component
   */
  modalTitle: string;
  /**
   * Passed body content from parent component
   */
  content: string;
  /**
   * Center content inside modal
   */
  contentCentered: boolean;
  /**
   * Emitted when user clicks on 'X' button.
   */
  close: EventEmitter<void>;
  /**
   * Host element as variable for manipulation
   */
  hostEl: HTMLElement;
  connectedCallback(): void;
  render(): any;
}
