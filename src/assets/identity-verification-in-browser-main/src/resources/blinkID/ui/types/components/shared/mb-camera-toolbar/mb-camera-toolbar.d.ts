/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */
import { EventEmitter } from '../../../stencil-public-runtime';
import { CameraEntry } from '../../../utils/data-structures';
export declare class MbCameraToolbar {
  private cameraSelection;
  isDesktop: boolean;
  /**
   * Set to `true` if close button should be displayed.
   */
  showClose: boolean;
  /**
   * Whether to show 'Camera flip' button.
   */
  enableCameraFlip: boolean;
  /**
   * Whether the camera is flipped, this property will be flip the relevant icon.
   */
  cameraFlipped: boolean;
  /**
   * Event which is triggered when close button is clicked.
   */
  closeEvent: EventEmitter<void>;
  /**
   * Event which is triggered when flip camera button is clicked.
   */
  flipEvent: EventEmitter<void>;
  /**
   * Emitted when user selects a different camera device.
   */
  changeCameraDevice: EventEmitter<CameraEntry>;
  /**
   * Host element as variable for manipulation
   */
  hostEl: HTMLElement;
  connectedCallback(): void;
  componentDidRender(): void;
  disconnectedCallback(): void;
  /**
   * Change active camera.
   */
  setActiveCamera(cameraId: string): Promise<void>;
  /**
   * Populate list of camera devices.
   */
  populateCameraDevices(): Promise<void>;
  private handleClose;
  private handleFlip;
  private handleResize;
  private handleChangeCameraDevice;
  render(): any;
}
