import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  Component,
  State,
  Method,
  Prop,
  FunctionalComponent
} from '@stencil/core';
import {
  BlinkIdCombinedRecognizer,
  CapturedFrame,
  captureFrame,
  createBlinkIdCombinedRecognizer,
  createRecognizerRunner,
  loadWasmModule,
  RecognizerResultState,
  RecognizerRunner,
  WasmSDKLoadSettings,
} from '@microblink/blinkid-in-browser-sdk';
import { BlinkIdDocScanImageConfig } from './blinkid-docscan-image.model';
import { applyDefaultCombinedRecognizerSettings } from '../blinkid-docscan/blinkid-docscan.utils';
import { consoleWarn } from '../../utils/logging.utils';
import { getAppUrlOrigin } from '../../utils/url.utils';

@Component({
  tag: 'blinkid-docscan-image',
  styleUrl: 'blinkid-docscan-image.css',
  shadow: true
})
export class BlinkIdDocscanImageComponent {
  @State()
  inProgress: boolean;
  @State()
  initInProgress: boolean;
  @State()
  scanInProgress: boolean;
  @State()
  errorMsg: string;
  @State()
  showFrontImageDropLayer: boolean;
  @State()
  showBackImageDropLayer: boolean;
  @State()
  frontImageFileName: string;
  @State()
  backImageFileName: string;
  @State()
  frontImageError: boolean;
  @State()
  backImageError: boolean;
  @Prop()
  config: BlinkIdDocScanImageConfig;
  @Method()
  async startScan(): Promise<void> {
    if (!this.loadDone) {
      consoleWarn('cannot start since load did not finish (bidi)');
      return;
    }

    if (this.inProgress) {
      consoleWarn('already in progress (bidi)');
    }

    this.resetProcessingVars();
    this.inProgress = true;

    if (!this.initDone) {
      await this.initialize();
    }
  }
  private loadDone: boolean;
  private initDone: boolean;
  private frontImageFileInput: HTMLInputElement;
  private backImageFileInput: HTMLInputElement;
  private helperImageElement: HTMLImageElement;
  private blinkIdEngine: any;

  constructor() {
    this.inProgress = false;
    this.initInProgress = true;
    this.loadDone = false;
    this.initDone = false;
    this.resetProcessingVars();
  }

  private resetProcessingVars = (): void => {
    this.scanInProgress = false;
    this.showFrontImageDropLayer = false;
    this.showBackImageDropLayer = false;
    this.frontImageFileName = null;
    this.backImageFileName = null;
    this.frontImageError = false;
    this.backImageError = false;
    this.removeErrorMsg();
    if (this.frontImageFileInput) { this.frontImageFileInput.value = null; }
    if (this.backImageFileInput) { this.backImageFileInput.value = null; }
  };

  /* Lifecycle */
  componentWillLoad(): void {
    if (!this.config.resourcesAlreadyLoaded) {
      this.loadBlinkIdCoreModule(); // has to be first
    } else {
      this.loadDone = true;
      this.config.callbacks.onLoadDone?.();
    }
  }

  /* Lifecycle */
  componentDidLoad(): void {
    this.initialize();
  }

  /* Lifecycle */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    return (
      <div
        class={ {
          'blinkid-docscan-image': true,
          'show': this.inProgress
        } }
      >
        <button-close-top-right
          callbacks={ { onClick: () => { this.onCloseClicked(); } } }
        ></button-close-top-right>
        <img
          hidden
          ref={ (elm: HTMLImageElement) => { this.helperImageElement = elm; } }
        />
        <div class="content">
          <p class="title">
            Choose from a gallery or drag and drop image
          </p>
          <div class="inputs">
            {/* Front Side Input */}
            <div
              class={ {
                'input': true,
                'error': this.frontImageError
              } }
              onDragOver={ (event: DragEvent) => {
                event.preventDefault();
                this.showFrontImageDropLayer = true;
              } }
              onDragLeave={ () => {
                this.showFrontImageDropLayer = false;
              } }
              onDrop={ (event: DragEvent) => {
                event.preventDefault();
                this.showFrontImageDropLayer = false;
                const files = event.dataTransfer.files;
                this.frontImageFileInput.files = files;
                this.frontImageFileName = this.getFileInputFileName(this.frontImageFileInput);
                if (this.frontImageError) {
                  this.frontImageError = false;
                  this.removeErrorMsg();
                }
              } }
            >
              <label>Front side image</label>
              { !this.frontImageFileName && (
                <p class="file">
                  <a
                    class="add"
                    href="javascript:void(0)"
                    onClick={ () => {
                      if (this.areButtonsDisabled()) { return; }
                      this.frontImageFileInput.click();
                    } }
                  >Add image&nbsp;<IconAdd></IconAdd></a>
                </p>
              ) }
              { this.frontImageFileName && (
                <p class="file">
                  <a
                    class="remove"
                    href="javascript:void(0)"
                    onClick={ () => {
                      if (this.areButtonsDisabled()) { return; }
                      this.frontImageFileInput.value = null;
                      this.frontImageFileName = null;
                      if (this.frontImageError) {
                        this.frontImageError = false;
                        this.removeErrorMsg();
                      }
                    } }
                  ><IconRemove></IconRemove></a>
                  { this.frontImageFileName }
                </p>
              ) }
              {/* Hidden Input */}
              <input
                id="front-side-file-input"
                disabled={ this.areButtonsDisabled() }
                class="form-control"
                type="file"
                accept="image/*"
                capture="environment"
                ref={ (elm: HTMLInputElement) => {
                  this.frontImageFileInput = elm;
                } }
                onChange={ () => {
                  this.frontImageFileName = this.getFileInputFileName(this.frontImageFileInput);
                  if (this.frontImageError) {
                    this.frontImageError = false;
                    this.removeErrorMsg();
                  }
                }}
              />
              { this.showFrontImageDropLayer && (
                <div class="image-select-drag-over-layer">
                  <label>Front side image</label>
                  <p class="file">
                    Drop image here
                    &nbsp;
                    <IconImage></IconImage>
                  </p>
                </div>
              ) }
            </div>
            {/* Back Side Input */}
            <div
              class={ {
                'input': true,
                'error': this.backImageError
              } }
              onDragOver={ (event: DragEvent) => {
                event.preventDefault();
                this.showBackImageDropLayer = true;
              } }
              onDragLeave={ () => {
                this.showBackImageDropLayer = false;
              } }
              onDrop={ (event: DragEvent) => {
                event.preventDefault();
                this.showBackImageDropLayer = false;
                const files = event.dataTransfer.files;
                this.backImageFileInput.files = files;
                this.backImageFileName = this.getFileInputFileName(this.backImageFileInput);
                if (this.backImageError) {
                  this.backImageError = false;
                  this.removeErrorMsg();
                }
              } }
            >
              <label>Back side image</label>
              { !this.backImageFileName && (
                <p class="file">
                  <a
                    class="add"
                    href="javascript:void(0)"
                    onClick={ () => {
                      if (this.areButtonsDisabled()) { return; }
                      this.backImageFileInput.click();
                    } }
                  >Add image&nbsp;<IconAdd></IconAdd></a>
                </p>
              ) }
              { this.backImageFileName && (
                <p class="file">
                  { this.backImageFileName }
                  <a
                    class="remove"
                    href="javascript:void(0)"
                    onClick={ () => {
                      if (this.areButtonsDisabled()) { return; }
                      this.backImageFileInput.value = null;
                      this.backImageFileName = null;
                      if (this.backImageError) {
                        this.backImageError = false;
                        this.removeErrorMsg();
                      }
                    } }
                  ><IconRemove></IconRemove></a>
                </p>
              ) }
              {/* Hidden Input */}
              <input
                id="backside-side-file-input"
                disabled={ this.areButtonsDisabled() }
                class="form-control"
                type="file"
                accept="image/*"
                capture="environment"
                ref={ (elm: HTMLInputElement) => { this.backImageFileInput = elm; } }
                onChange={ () => {
                  this.backImageFileName = this.getFileInputFileName(this.backImageFileInput);
                  if (this.backImageError) {
                    this.backImageError = false;
                    this.removeErrorMsg();
                  }
                }}
              />
              { this.showBackImageDropLayer && (
                <div class="image-select-drag-over-layer">
                  <label>Back side image</label>
                  <p class="file">
                    Drop image here
                    &nbsp;
                    <IconImage></IconImage>
                  </p>
                </div>
              ) }
            </div>
          </div>
          { this.errorMsg && (<p class="error">{ this.errorMsg }</p>) }
          <p class="button">
            <button
              disabled={ this.areButtonsDisabled() }
              class="primary medium"
              onClick={ () => { this.onScanClicked(); }}
            >
              { !this.scanInProgress && 'Upload' }
              { this.scanInProgress && (<icon-loader></icon-loader>) }
            </button>
          </p>
        </div>
      </div>
    );
  }

  private areButtonsDisabled = (): boolean => {
    return this.initInProgress || this.scanInProgress;
  };

  private initialize = async (): Promise<void> => {
    let loadSettings: WasmSDKLoadSettings;
    try {
      loadSettings = new WasmSDKLoadSettings(this.config.blinkidLicence);
      loadSettings.engineLocation = `${getAppUrlOrigin()}${this.config.resourcesDirPath}blinkID/`;
      loadSettings.allowHelloMessage = false;
    } catch (err) {
      this.config.callbacks.onLoadDone?.(); // cleaning
      if (navigator.onLine) {
        this.config.callbacks.onError('ERROR_LICENSE');
      } else {
        this.config.callbacks.onError('ERROR_NETWORK');
      }

      this.initInProgress = false;
      this.close();
      return;
    }

    try {
      this.blinkIdEngine = await loadWasmModule(loadSettings);
    } catch (err) {
      this.config.callbacks.onLoadDone?.(); // cleaning
      if (navigator.onLine) {
        this.config.callbacks.onError('ERROR');
      } else {
        this.config.callbacks.onError('ERROR_NETWORK');
      }

      this.initInProgress = false;
      this.close();
      return;
    }

    this.initDone = true;
    this.initInProgress = false;
  };

  private createRecognizer = async (scanCroppedDocumentImage = false): Promise<{
    combinedRecognizer: BlinkIdCombinedRecognizer
    recognizerRunner: RecognizerRunner
  }> => {
    // 1. create recognizer
    const combinedRecognizer = await createBlinkIdCombinedRecognizer(this.blinkIdEngine);
    // 2. configure
    const settings = await combinedRecognizer.currentSettings();
    applyDefaultCombinedRecognizerSettings(settings);
    settings.allowUncertainFrontSideScan = true;
    settings.scanCroppedDocumentImage = scanCroppedDocumentImage;
    if (this.config.skipUnsupportedBack != null) {
      settings.skipUnsupportedBack = this.config.skipUnsupportedBack;
    }
    await combinedRecognizer.updateSettings(settings);
    // 3. create recognizers runner
    const recognizerRunner = await createRecognizerRunner(
      this.blinkIdEngine,
      [combinedRecognizer],
      false
    );

    return {
      combinedRecognizer,
      recognizerRunner
    };
  }

  private repurposeRecognizer = async (
    scanCroppedDocumentImage: boolean,
    currentCombinedRecognizer: BlinkIdCombinedRecognizer,
    recognizerRunner: RecognizerRunner
  ): Promise<BlinkIdCombinedRecognizer> => {
    // 1. create new recognizer with updated settings
    const settings = await currentCombinedRecognizer.currentSettings();
    settings.scanCroppedDocumentImage = scanCroppedDocumentImage;
    const newCombinedRecognizer = await createBlinkIdCombinedRecognizer(this.blinkIdEngine);
    await newCombinedRecognizer.updateSettings(settings);
    // 2. update runner
    await recognizerRunner.reconfigureRecognizers(
      [newCombinedRecognizer],
      false
    );
    // 3. delete old recognizer
    await currentCombinedRecognizer.delete();

    return newCombinedRecognizer;
  };

  // private recognizerResultStatePretty = (state: RecognizerResultState): string => {
  //   if (state === RecognizerResultState.Empty) { return 'Empty'; }
  //   if (state === RecognizerResultState.Uncertain) { return 'Uncertain'; }
  //   if (state === RecognizerResultState.Valid) { return 'Valid'; }
  //   if (state === RecognizerResultState.StageValid) { return 'StageValid'; }
  //   return 'unknown';
  // };

  private onScanClicked = async (): Promise<void> => {
    if (this.scanInProgress) {
      return;
    }

    /* 1. Setup */

    this.removeErrorMsg();
    this.frontImageError = false;
    this.backImageError = false;
    this.scanInProgress = true;
    let scanCroppedDocumentImage = false;

    let {
      combinedRecognizer,
      recognizerRunner // eslint-disable-line prefer-const
    } = await this.createRecognizer(scanCroppedDocumentImage);

    const clean = (): void => {
      recognizerRunner.delete();
      combinedRecognizer.delete();
      this.scanInProgress = false;
    };

    const handleGetImageFrameFail = () => {
      this.showErrorMsg('Front document image processing failed. Please try again.');
      this.frontImageError = true;
      clean();
    };

    /* 2. Process Front */

    // process front image
    const fileFrontSide = this.getImageFromFileInput(this.frontImageFileInput.files);
    if (!fileFrontSide) {
      this.showErrorMsg('Front document image not provided.');
      this.frontImageError = true;
      clean();
      return;
    }

    // standard doc scan
    let imageFrameFrontSide = await this.getImageFrame(fileFrontSide);

    if (!imageFrameFrontSide) {
      handleGetImageFrameFail();
      return;
    }

    let processResultFrontSide = await recognizerRunner.processImage(imageFrameFrontSide);
    // console.log('processResultFrontSide:', this.recognizerResultStatePretty(processResultFrontSide));
    let scanDoneFirstSide = processResultFrontSide === RecognizerResultState.Valid
      || processResultFrontSide === RecognizerResultState.StageValid;

    // (optional) cropped doc scan
    if (!scanDoneFirstSide) {
      // console.log('first side scan > trying cropped scan');
      // i. repurpose
      scanCroppedDocumentImage = !scanCroppedDocumentImage;
      combinedRecognizer = await this.repurposeRecognizer(scanCroppedDocumentImage, combinedRecognizer, recognizerRunner);
      // ii. scan again
      imageFrameFrontSide = await this.getImageFrame(fileFrontSide);

      if (!imageFrameFrontSide) {
        handleGetImageFrameFail();
        return;
      }

      processResultFrontSide = await recognizerRunner.processImage(imageFrameFrontSide);
      // console.log('processResultFrontSide:', this.recognizerResultStatePretty(processResultFrontSide));
      scanDoneFirstSide = processResultFrontSide === RecognizerResultState.Valid
        || processResultFrontSide === RecognizerResultState.StageValid;
    }

    if (!scanDoneFirstSide) {
      this.showErrorMsg('Front document image processing failed. Please try again.');
      this.frontImageError = true;
      clean();
      return;
    }

    const middleResult = await combinedRecognizer.getResult();
    // console.log('middleResult:', this.recognizerResultStatePretty(middleResult.state));
    const frontSideIsEnough = middleResult.state === RecognizerResultState.Valid;

    /* 3. Process Back */

    if (!frontSideIsEnough) {
      // process back image
      const fileBackSide = this.getImageFromFileInput(this.backImageFileInput.files);
      if (!fileBackSide) {
        this.showErrorMsg('Back document image not provided.');
        this.backImageError = true;
        clean();
        return;
      }

      // standard doc scan
      const imageFrameBackSide = await this.getImageFrame(fileBackSide);

      if (!imageFrameFrontSide) {
        handleGetImageFrameFail();
        return;
      }

      const processResultBackSide = await recognizerRunner.processImage(imageFrameBackSide);
      // console.log('processResultBackSide:', this.recognizerResultStatePretty(processResultBackSide));
      const scanDoneBackSide = processResultBackSide === RecognizerResultState.Valid
        || processResultBackSide === RecognizerResultState.Uncertain;

      if (!scanDoneBackSide) {
        if (processResultBackSide == RecognizerResultState.StageValid) {
          this.showErrorMsg('If using cropped images, please provide both images as cropped and try again.');
          this.frontImageError = true;
          this.backImageError = true;
        } else {
          this.showErrorMsg('Back document image processing failed. Please try again.');
          this.backImageError = true;
        }
        clean();
        return;
      }
    }

    /* 4. Extract result */

    const originalData = await combinedRecognizer.getResult();
    // console.log('finalResult:', this.recognizerResultStatePretty(originalData.state))
    if (originalData.state === RecognizerResultState.Empty) {
      clean();
      return;
    }
    const originalDataSigningResult = await combinedRecognizer.toSignedJSON();

    /* 5. Finalize */

    this.config.callbacks.onSuccess({
      originalData,
      originalDataJSON: originalDataSigningResult.payload,
      originalDataJSONSignature: originalDataSigningResult.signature,
      originalDataJSONSignatureVersion: originalDataSigningResult.signatureVersion
    });
    this.close();
    clean();
  };

  private getImageFromFileInput = (files: FileList): File => {
    let image: File = null;
    const imageRegex = RegExp(/^image\//);
    for (let i = 0; i < files.length; i++) {
      if (imageRegex.exec(files[i].type)) {
        image = files[i];
      }
    }
    return image;
  };

  private getImageFrame = async (file: File): Promise<CapturedFrame> => {
    try {
      this.helperImageElement.src = URL.createObjectURL( file );
      await this.helperImageElement.decode();
      const capturedFrame = await captureFrame(this.helperImageElement);
      return capturedFrame;
    } catch(err) {
      // console.error('getImageFrame > err:', err);
      return null;
    }
  }

  private getFileInputFileName = (fileInput: HTMLInputElement) => {
    if (fileInput == null) { return null; }
    const file = this.getImageFromFileInput(fileInput.files);
    return file.name;
  }

  private onCloseClicked = () => {
    if (this.areButtonsDisabled()) {
      return;
    }
    this.config.callbacks.onClose?.();
    this.close();
  };

  private close = (): void => {
    this.inProgress = false;
  };

  private showErrorMsg = (text: string) => {
    this.errorMsg = text;
  };

  private removeErrorMsg = () => {
    this.errorMsg = null;
  };

  /* blinkid load */

  private loadBlinkIdCoreModule = (): void => {
    const script = document.createElement('script');
    script.onload = () => {
      this.loadDone = true;
      this.config.callbacks.onLoadDone?.();
    };
    script.src = `${this.config.resourcesDirPath}blinkID/ui/blinkid-in-browser/blinkid-in-browser.esm.js`;
    script.type = 'module';
    script.async = false;
    document.head.appendChild(script);
  };
}

interface IconImageProps {
  size?: string;
}

const IconImage: FunctionalComponent<IconImageProps> = (props: IconImageProps) => {
  const size = props.size || '15px';
  return (
    <svg
      width={ size }
      height={ size }
      viewBox='0 0 16 16'
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill-rule="evenodd" clip-rule="evenodd" d="M2.16667 3.83333C2.16667 2.91286 2.91286 2.16667 3.83333 2.16667H12.1667C13.0871 2.16667 13.8333 2.91286 13.8333 3.83333V8.48816L13.5893 8.24408L13.5778 8.23285C13.0758 7.74982 12.4465 7.44177 11.75 7.44177C11.0535 7.44177 10.4242 7.74982 9.92219 8.23285L9.91074 8.24408L9.66667 8.48816L7.75592 6.57741L7.74448 6.56619C7.2425 6.08316 6.61317 5.77511 5.91667 5.77511C5.22016 5.77511 4.59083 6.08316 4.08885 6.56619L4.07741 6.57741L2.16667 8.48816V3.83333ZM9.07809 10.2566L10.7441 11.9226C11.0695 12.248 11.5972 12.248 11.9226 11.9226C12.248 11.5972 12.248 11.0695 11.9226 10.7441L10.8452 9.66667L11.0831 9.42879C11.3391 9.1844 11.5701 9.10844 11.75 9.10844C11.93 9.10844 12.1609 9.1844 12.4169 9.42879L13.8333 10.8452V12.1667C13.8333 13.0871 13.0871 13.8333 12.1667 13.8333H3.83333C2.91286 13.8333 2.16667 13.0871 2.16667 12.1667V10.8452L5.24972 7.76212C5.50575 7.51773 5.73672 7.44177 5.91667 7.44177C6.09662 7.44177 6.32758 7.51773 6.58361 7.76212L9.07674 10.2552C9.07696 10.2555 9.07719 10.2557 9.07741 10.2559C9.07764 10.2561 9.07786 10.2564 9.07809 10.2566ZM0.5 12.1667V10.5001V10.4999V3.83333C0.5 1.99238 1.99238 0.5 3.83333 0.5H12.1667C14.0076 0.5 15.5 1.99238 15.5 3.83333V12.1667C15.5 14.0076 14.0076 15.5 12.1667 15.5H3.83333C1.99238 15.5 0.5 14.0076 0.5 12.1667ZM10.5 3.83333C10.0398 3.83333 9.66667 4.20643 9.66667 4.66667C9.66667 5.1269 10.0398 5.5 10.5 5.5H10.5083C10.9686 5.5 11.3417 5.1269 11.3417 4.66667C11.3417 4.20643 10.9686 3.83333 10.5083 3.83333H10.5Z" fill="#0062F2"/>
    </svg>
  );
};

interface IconRemoveProps {
  size?: string;
}

const IconRemove: FunctionalComponent<IconRemoveProps> = (props: IconRemoveProps) => {
  const size = props.size || '15px';
  return (
    <svg
      width={ size }
      height={ size }
      viewBox='0 0 12 12'
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5893 1.58925C11.9148 1.26381 11.9148 0.736171 11.5893 0.410734C11.2639 0.0852972 10.7363 0.0852972 10.4108 0.410734L6.00008 4.82148L1.58934 0.410734C1.2639 0.0852972 0.736263 0.0852972 0.410826 0.410734C0.0853888 0.736171 0.0853888 1.26381 0.410826 1.58925L4.82157 5.99999L0.410826 10.4107C0.0853888 10.7362 0.0853888 11.2638 0.410826 11.5892C0.736263 11.9147 1.2639 11.9147 1.58934 11.5892L6.00008 7.1785L10.4108 11.5892C10.7363 11.9147 11.2639 11.9147 11.5893 11.5892C11.9148 11.2638 11.9148 10.7362 11.5893 10.4107L7.17859 5.99999L11.5893 1.58925Z" fill="#9CA3AF"/>
    </svg>
  );
};

interface IconAddProps {
  size?: string;
}

const IconAdd: FunctionalComponent<IconAddProps> = (props: IconAddProps) => {
  const size = props.size || '15px';
  return (
    <svg
      width={ size }
      height={ size }
      viewBox='0 0 14 14'
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill-rule="evenodd" clip-rule="evenodd" d="M7.83325 1.16671C7.83325 0.70647 7.46016 0.333374 6.99992 0.333374C6.53968 0.333374 6.16659 0.70647 6.16659 1.16671V6.16671H1.16659C0.706348 6.16671 0.333252 6.5398 0.333252 7.00004C0.333252 7.46028 0.706348 7.83337 1.16659 7.83337H6.16659V12.8334C6.16659 13.2936 6.53968 13.6667 6.99992 13.6667C7.46016 13.6667 7.83325 13.2936 7.83325 12.8334V7.83337H12.8333C13.2935 7.83337 13.6666 7.46028 13.6666 7.00004C13.6666 6.5398 13.2935 6.16671 12.8333 6.16671H7.83325V1.16671Z" fill="#0062F2"/>
    </svg>
  );
};