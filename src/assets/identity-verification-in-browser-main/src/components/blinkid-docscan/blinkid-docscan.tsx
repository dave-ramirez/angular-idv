import {
  BlinkIdCombinedRecognizerResult,
} from '@microblink/blinkid-in-browser-sdk';
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  Component,
  FunctionalComponent,
  Prop,
  Method,
  State,
} from '@stencil/core';
import {
  BlinkIdDocScanCameraSuccessData
} from '../blinkid-docscan-camera/blinkid-docscan-camera.model';
import {
  BlinkIdDocScanResultLayerConfirmData,
  BlinkIdResultEditedData
} from '../blinkid-docscan-result-layer/blinkid-docscan-result-layer.model';
import {
  BlinkIdDocScanConfig,
  BlinkIdDocScanError,
} from './blinkid-docscan.model';
import { ButtonIcon } from '../button-icon-round/button-icon-round.model';
import { consoleWarn } from '../../utils/logging.utils';
import { VerifyServerApiClient } from '../../utils/verify-server.utils';

const HAS_LOBBY_DEFAULT = true;
const SKIP_LOBBY_DEFAULT = false;
const FINALIZING_SPINNER_DELAY_MS = 100;

@Component({
  tag: 'blinkid-docscan',
  styleUrl: 'blinkid-docscan.css',
  shadow: true
})
export class BlinkIdDocScan {
  @State()
  inProgress: boolean;
  @State()
  selectedDocScanOption: 'tbd' | 'camera' | 'image';
  @State()
  sendScannedDocumentToServerInProgress: boolean;
  @State()
  sendScannedDocumentToServerFailed: boolean;
  @State()
  showLobby: boolean;
  @Prop()
  hasLobby = HAS_LOBBY_DEFAULT;
  @Prop()
  config!: BlinkIdDocScanConfig;
  @Method()
  async startScan(skipLobby = SKIP_LOBBY_DEFAULT): Promise<void> {
    if (!this.loadDone) {
      consoleWarn('cannot start since load did not finish (bid)');
      return;
    }

    if (skipLobby) {
      this.showLobby = false;
    } else {
      this.showLobby = true;
    }

    if (this.hasLobby && !skipLobby) {
      this.config.callbacks.onStart();
      this.config.callbacks.onStartDone();
      return;
    }

    if (this.inProgress) {
      consoleWarn('already in progress (bid)');
      return;
    }

    this.config.callbacks.onStart();

    this.inProgress = true;

    // by default it will always offer options
    if(!skipLobby) {
      this.selectedDocScanOption = 'tbd';
    }
    else if(this.selectedDocScanOption === 'camera') {
      this.scanCameraElement.startScan();
    }
    else if(this.selectedDocScanOption === 'image') {
      this.scanImageElement.startScan();
    }

    this.config.callbacks.onStartDone();
  }
  @Method()
  async reviewScan(): Promise<void> {
    if (!this.loadDone) {
      consoleWarn('cannot start since load did not finish (bid)');
      return;
    }

    if (!this.originalData) { return; }

    this.openResultLayer(this.originalData);
  }
  @Method()
  async reset(): Promise<void> {
    this.resetProcessingVars();
  }
  // processing vars
  private originalData: BlinkIdCombinedRecognizerResult;
  private originalDataJSON: string;
  private originalDataJSONSignature: string;
  private originalDataJSONSignatureVersion: string;
  private editedData: BlinkIdResultEditedData;
  // once-assigned vars
  private scanCameraElement: HTMLBlinkidDocscanCameraElement;
  private scanImageElement: HTMLBlinkidDocscanImageElement;
  private resultLayerElement: HTMLBlinkidDocscanResultLayerElement;
  private loadDone = false;

  constructor() {
    this.resetProcessingVars();
  }

  private resetProcessingVars = (): void => {
    // processing vars + state vars
    this.showLobby = false;
    this.inProgress = false;
    this.selectedDocScanOption = 'tbd';
    this.sendScannedDocumentToServerInProgress = false;
    this.sendScannedDocumentToServerFailed = false;
    this.originalData = null;
    this.originalDataJSON = null;
    this.originalDataJSONSignature = null;
    this.originalDataJSONSignatureVersion = null;
  };

  /* Lifecycle */
  componentWillLoad(): void {
    this.loadBlinkIdCoreModule();
  }

  /* Lifecycle */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    return (
      <div class="blinkid-docscan">
        { this.hasLobby && this.inProgress && !this.sendScannedDocumentToServerInProgress && (
          <Options
            callbacks={ {
              onFromCameraClicked: () => { this.cameraScanClicked(); },
              onFromImageClicked: () => { this.imageScanClicked(); }
            } }
          ></Options>
        ) }
        { !this.hasLobby && (
          <div
            class={ {
              'blinkid-docscan-layer': true,
              'show': this.inProgress
            } }
          >
            <button-close-top-right
              callbacks={ {
                onClick: () => {
                  this.config.callbacks.onFinish();
                  this.close();
                }
              } }
            ></button-close-top-right>
            <OptionsLayer
              show={ this.inProgress && this.selectedDocScanOption === 'tbd' }
              callbacks={ {
                onCloseClicked: () => {
                  this.config.callbacks.onFinish();
                  this.close();
                },
                onFromCameraClicked: () => { this.cameraScanClicked(); },
                onFromImageClicked: () => { this.imageScanClicked(); },
              } }
            ></OptionsLayer>
          </div>
        )}
        <blinkid-docscan-camera
          config={ {
            blinkidLicence: this.config.blinkidLicence,
            resourcesDirPath: this.config.resourcesDirPath,
            skipUnsupportedBack: this.config.skipUnsupportedBack,
            callbacks: {
              onSuccess: (data: BlinkIdDocScanCameraSuccessData) => {
                this.originalData = data.originalData;
                this.originalDataJSON = data.originalDataJSON;
                this.originalDataJSONSignature = data.originalDataJSONSignature;
                this.originalDataJSONSignatureVersion = data.originalDataJSONSignatureVersion;
                this.openResultLayer(this.originalData);
              },
              onError: (error: BlinkIdDocScanError) => {
                if (error === 'ERROR_NETWORK') {
                  /*
                    Process is not yet finished - it waits for a root component to remove
                    network problems.
                  */
                  this.config.callbacks.onNetworkProblems();
                  return;
                }
                if (error === 'ERROR_LICENSE') {
                  this.config.callbacks.onStartDone(); // needed if error happened early
                  this.config.callbacks.onFinish({ error: 'ERROR_LICENSE' });
                  this.close();
                  return;
                }

                // else: 'ERROR'
                // do nothing
              },
            },
            resourcesAlreadyLoaded: true
          } }
          ref={ (el: HTMLBlinkidDocscanCameraElement) => { this.scanCameraElement = el; } }
        ></blinkid-docscan-camera>
        <blinkid-docscan-image
          config={ {
            blinkidLicence: this.config.blinkidLicence,
            resourcesDirPath: this.config.resourcesDirPath,
            skipUnsupportedBack: this.config.skipUnsupportedBack,
            callbacks: {
              onSuccess: (data: BlinkIdDocScanCameraSuccessData) => {
                this.originalData = data.originalData;
                this.originalDataJSON = data.originalDataJSON;
                this.originalDataJSONSignature = data.originalDataJSONSignature;
                this.originalDataJSONSignatureVersion = data.originalDataJSONSignatureVersion;
                this.openResultLayer(this.originalData);
              },
              onError: (error: BlinkIdDocScanError) => {
                if (error === 'ERROR_NETWORK') {
                  /*
                    Process is not yet finished - it waits for a root component to remove
                    network problems.
                  */
                  this.config.callbacks.onNetworkProblems();
                  return;
                }
                if (error === 'ERROR_LICENSE') {
                  this.config.callbacks.onStartDone(); // cleaning
                  this.config.callbacks.onFinish({ error: 'ERROR_LICENSE' });
                  this.close();
                  return;
                }

                // else: 'ERROR'
                // do nothing
              },
            },
            resourcesAlreadyLoaded: true
          } }
          ref={ (elm: HTMLBlinkidDocscanImageElement) => { this.scanImageElement = elm; } }
        ></blinkid-docscan-image>
        <blinkid-docscan-result-layer
          config={ {
            callbacks: {
              onClose: () => { this.onResultDataClose(); },
              onReject: () => { this.onResultDataClose(); },
              onConfirm: (data: BlinkIdDocScanResultLayerConfirmData) => {
                const { editedData } = data;
                this.editedData = editedData;
                this.sendScannedDocumentToServerAndHandleResult();
              },
              onRepeat: () => { this.onResultDataRepeat(); }
            }
          } }
          ref={ (elm: HTMLBlinkidDocscanResultLayerElement) => { this.resultLayerElement = elm; } }
        ></blinkid-docscan-result-layer>
        <DocumentSaveErrorLayer
          show={ this.inProgress && this.sendScannedDocumentToServerFailed }
          callbacks={ {
            onClose: () => {
              this.config.callbacks.onFinish({ error: 'ERROR' });
              this.close(true);
            },
            onAction: () => {
              this.sendScannedDocumentToServerFailed = false;
              this.sendScannedDocumentToServerAndHandleResult();
            }
          } }
        ></DocumentSaveErrorLayer>
        { this.sendScannedDocumentToServerInProgress && (
          <processing-layer></processing-layer>
        ) }
      </div>
    );
  }

  private close = (hideLobby?: boolean): void => {
    this.showLobby = hideLobby == null ? this.hasLobby : !hideLobby;
    this.inProgress = false;
  };

  private cameraScanClicked = async (): Promise<void> => {
    this.selectedDocScanOption = 'camera';
    await this.scanCameraElement.startScan();
  };

  private imageScanClicked = async (): Promise<void> => {
    this.selectedDocScanOption = 'image';
    await this.scanImageElement.startScan();
  };

  /* result layer logic */

  private openResultLayer = (originalData: BlinkIdCombinedRecognizerResult): void => {
    this.resultLayerElement.open(originalData);
  };

  private onResultDataClose = (): void => {
    this.originalData = null;
    this.originalDataJSON = null;
    this.originalDataJSONSignature = null;
    this.originalDataJSONSignatureVersion = null;
  }

  private onResultDataRepeat = (): void => {
    this.startScan(true);
  };

  private sendScannedDocumentToServerAndHandleResult = async (): Promise<void> => {
    this.sendScannedDocumentToServerInProgress = true;

    const sent = await this.sendScannedDocumentToServer();

    if (sent) {
      this.config.callbacks.onFinish({
        success: {
          originalData: this.originalData,
          originalDataJSON: this.originalDataJSON,
          originalDataJSONSignature: this.originalDataJSONSignature,
          originalDataJSONSignatureVersion: this.originalDataJSONSignatureVersion,
          editedData: this.editedData
        }
      });

      this.close(true);
    } else {
      this.sendScannedDocumentToServerFailed = true;
    }

    setTimeout(
      () => { this.sendScannedDocumentToServerInProgress = false; },
      FINALIZING_SPINNER_DELAY_MS
    );
  };

  private sendScannedDocumentToServer = async (): Promise<boolean> => {
    let succeeded;
    try {
      await VerifyServerApiClient.saveScannedDocument(
        {
          originalData: this.originalDataJSON,
          originalDataSignature: {
            value: this.originalDataJSONSignature,
            version: this.originalDataJSONSignatureVersion
          },
          editedData: this.editedData,
          insertedData: {}
        }
      );
      succeeded = true;
    } catch (err) {
      if (!navigator.onLine) {
        this.config.callbacks.onNetworkProblems();
      }
      succeeded = false;
    }

    return succeeded;
  };

  /* blinkid load */

  private loadBlinkIdCoreModule = (): void => {
    const script = document.createElement('script');
    script.onload = () => {
      this.loadDone = true;
      this.config.callbacks.onLoadDone();
    };
    script.src = `${this.config.resourcesDirPath}blinkID/ui/blinkid-in-browser/blinkid-in-browser.esm.js`;
    script.type = 'module';
    script.async = false;
    document.head.appendChild(script);
  };
}

/* Helper Functional Components */

interface OptionsProps {
  callbacks: {
    onFromCameraClicked: () => void;
    onFromImageClicked: () => void;
  }
}

const Options: FunctionalComponent<OptionsProps> = (props: OptionsProps) => {
  return (
    <div class="options">
      <div class="option-col">
        <p class="button">
          <button-icon-round
            icon={ ButtonIcon.Camera }
            callbacks={ { onClick: () => { props.callbacks.onFromCameraClicked(); } } }
          ></button-icon-round>
        </p>
        <p class="text">
          Use your camera
        </p>
      </div>
      <div class="option-col">
        <p class="button">
          <button-icon-round
            icon={ ButtonIcon.Image }
            callbacks={ { onClick: () => { props.callbacks.onFromImageClicked(); } } }
          ></button-icon-round>
        </p>
        <p class="text">
          Upload photos
        </p>
      </div>
    </div>
  );
};

interface OptionsLayerProps {
  show: boolean;
  callbacks: {
    onCloseClicked: () => void;
    onFromCameraClicked: () => void;
    onFromImageClicked: () => void;
  }
}

const OptionsLayer: FunctionalComponent<OptionsLayerProps> = (props: OptionsLayerProps) => {
  return (
    <div
      class={ {
        'options-layer': true,
        'show': props.show
      } }
    >
      <button-close-top-right
        callbacks={ {
          onClick: () => { props.callbacks.onCloseClicked(); }
        } }
      ></button-close-top-right>
      <div class="content">
        <p>
          <button-icon-round
            icon={ ButtonIcon.Camera }
            callbacks={ { onClick: () => { props.callbacks.onFromCameraClicked(); } } }
            marginRight='8px'
          ></button-icon-round>
          <button-icon-round
            icon={ ButtonIcon.Image }
            callbacks={ { onClick: () => { props.callbacks.onFromImageClicked(); } } }
          ></button-icon-round>
        </p>
      </div>
    </div>
  );
};

interface DocumentSaveErrorLayerProps {
  show: boolean;
  callbacks: {
    onClose: () => void,
    onAction: () => void
  };
}

const DocumentSaveErrorLayer = (
  props: DocumentSaveErrorLayerProps
): FunctionalComponent<DocumentSaveErrorLayerProps> => {
  return (
    <div
      class={ {
        'document-save-error-layer': true,
        'visible': props.show
      } }
    >
      <button-close-top-right
        callbacks={ {
          onClick: () => { props.callbacks.onClose(); }
        } }
      ></button-close-top-right>
      <div class="content">
        { navigator.onLine && (
          <p class="icon">
            <icon-fail-circle></icon-fail-circle>
          </p>
        ) }
        <p class="message">
          Something went wrong while finalizing document scan.
          There might be a problem with your network. Check your data or wifi connection.
        </p>
        <p class="button">
          <button
            class="primary"
            onClick={ () => { props.callbacks.onAction(); } }
          >Retry</button>
        </p>
      </div>
    </div>
  );
};
