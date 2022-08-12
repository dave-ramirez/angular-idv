import '../../global.css';
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h,
  Component,
  Prop,
  FunctionalComponent,
  State,
  Method,
} from '@stencil/core';
import { BlinkIdCombinedRecognizerResult } from '@microblink/blinkid-in-browser-sdk';
import { buildDataUrlFromImageData } from '../../utils/image.utils';
import {
  BidResultEditHelper,
  BidResultEditableAttr,
  BlinkIdDocScanResultLayerConfig
} from './blinkid-docscan-result-layer.model';
import { consoleError, consoleWarn } from '../../utils/logging.utils';

@Component({
  tag: 'blinkid-docscan-result-layer',
  styleUrl: 'blinkid-docscan-result-layer.css',
  shadow: true
})
export class BlinkIdDocScanResultLayerComponent {
  @State()
  inProgress: boolean;
  @State()
  renderForcer: number;
  @Prop()
  config?: BlinkIdDocScanResultLayerConfig;
  @Method()
  async open(originalData: BlinkIdCombinedRecognizerResult): Promise<void> {
    if (this.inProgress) {
      consoleWarn('already open (bidr)');
      return;
    }
    if (originalData == null) {
      consoleError('missing original data (bidr)');
      return;
    }

    this.originalData = originalData;
    this.editHelper = new BidResultEditHelper(this.originalData);
    this.inProgress = true;

    this.scrollableBodyElement?.scroll({ top: 0 });
  }

  private originalData: BlinkIdCombinedRecognizerResult;
  private editHelper: BidResultEditHelper;
  private scrollableBodyElement: HTMLDivElement;

  constructor() {
    this.resetProcessingData();
    this.scrollableBodyElement = null;
  }

  private resetProcessingData = (): void => {
    this.inProgress = false;
    this.renderForcer = 1;
    this.originalData = null;
    this.editHelper = null;
  };

  private forceRender = () => {
    this.renderForcer = Math.random() + 1;
  }

  /* Lifecycle */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    return (
      <div
        class={{
          'blinkid-result': true,
          'show': this.inProgress
        }}
      >
        {/* Render Invoker */}
        { this.renderForcer && (<div hidden>{ this.renderForcer }</div>) }
        {/*  */}
        <div class="header">Your information</div>
        <button-close-top-right
          callbacks={ { onClick: () => { this.handleCloseClick(); } }}
        ></button-close-top-right>
        { this.originalData && (
          <div
            class="body"
            ref={ (bodyEl: HTMLDivElement) => { this.scrollableBodyElement = bodyEl; } }
          >
            { this.originalData.faceImage.rawImage && (
              <p class="selfie">
                <FaceImage
                  name="FACE IMAGE"
                  imageData={this.originalData.faceImage.rawImage}
                ></FaceImage>
              </p>
            ) }
            { this.showFullNameCase() && (
              <p class="name">
                { this.editHelper.getValue(BidResultEditableAttr.fullName) }
              </p>
            ) }
            { this.showFirstLastNameCase() && (
              <p class="name">
                { `${this.editHelper.getValue(BidResultEditableAttr.firstName)} ${this.editHelper.getValue(BidResultEditableAttr.lastName)}` }
              </p>
            ) }
            <p class="address">
              { `${this.editHelper.getValue(BidResultEditableAttr.address)}` }
            </p>
            <div class="attributes container-fluid">
              <div class="row" style={ { paddingBottom: '29px' } }>
                { this.showFullNameCase() && (
                  <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                    <editable-string-attribute
                      value={ this.editHelper.getValue(BidResultEditableAttr.fullName)}
                      config={ {
                        label: 'Full name',
                        onValueChange: (newValue: string) => {
                          this.editHelper.applyEdit(BidResultEditableAttr.fullName, newValue);
                          this.forceRender();
                        }
                      } }
                    />
                  </div>
                ) }
                { this.showFirstLastNameCase() && (
                  <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                    <editable-string-attribute
                      value={ this.editHelper.getValue(BidResultEditableAttr.firstName)}
                      config={ {
                        label: 'First name',
                        onValueChange: (newValue: string) => {
                          this.editHelper.applyEdit(BidResultEditableAttr.firstName, newValue);
                          this.forceRender();
                        }
                      } }
                    ></editable-string-attribute>
                  </div>
                ) }
                { this.showFirstLastNameCase() && (
                  <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                    <editable-string-attribute
                      value={ this.editHelper.getValue(BidResultEditableAttr.lastName)}
                      config={ {
                        label: 'Last name',
                        onValueChange: (newValue: string) => {
                          this.editHelper.applyEdit(BidResultEditableAttr.lastName, newValue);
                          this.forceRender();
                        }
                      } }
                    ></editable-string-attribute>
                  </div>
                ) }
                <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                  <StringAttribute
                    label={'Date of birth'}
                    value={ this.originalData.dateOfBirth.originalString }
                  ></StringAttribute>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                  <StringAttribute
                    label={'Sex'}
                    value={ this.originalData.sex }
                  ></StringAttribute>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                  <StringAttribute
                    label={'Personal id number'}
                    value={ this.originalData.personalIdNumber }
                  ></StringAttribute>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                  <editable-string-attribute
                    value={ this.editHelper.getValue(BidResultEditableAttr.address)}
                    config={ {
                      label: 'Address',
                      onValueChange: (newValue: string) => {
                        this.editHelper.applyEdit(BidResultEditableAttr.address, newValue);
                        this.forceRender();
                      }
                    } }
                  ></editable-string-attribute>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                  <StringAttribute
                    label={'Nationality'}
                    value={this.originalData.nationality}
                  ></StringAttribute>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                  <StringAttribute
                    label={'Document number'}
                    value={this.originalData.documentNumber}
                  ></StringAttribute>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                  <StringAttribute
                    label={'Issuing authority'}
                    value={this.originalData.issuingAuthority}
                  ></StringAttribute>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                  <StringAttribute
                    label={'Date of issue'}
                    value={this.originalData.dateOfIssue.originalString}
                  ></StringAttribute>
                </div>
                <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                  <StringAttribute
                    label={'Date of expiry'}
                    value={this.originalData.dateOfExpiry.originalString}
                  ></StringAttribute>
                </div>
              </div>
              <div class="row justify-content-center">
                <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                  <DocumentImageAttribute
                    label="Document front"
                    value={this.originalData.fullDocumentFrontImage.rawImage}
                  ></DocumentImageAttribute>
                </div>
                { this.originalData.fullDocumentBackImage?.rawImage && (
                  <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                    <DocumentImageAttribute
                      label="Document back"
                      value={this.originalData.fullDocumentBackImage.rawImage}
                    ></DocumentImageAttribute>
                  </div>
                ) }
              </div>
              <div class="row justify-content-center">
                { this.originalData.signatureImage?.rawImage && (
                  <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                    <DocumentImageAttribute
                      label="Signature"
                      value={this.originalData.signatureImage.rawImage}
                    ></DocumentImageAttribute>
                  </div>
                ) }
              </div>
            </div>
          </div>
        ) }
        <div class="footer">
          <div class="content">
            <p class="note">Is everything correct?</p>
            <p class="buttons">
              <button
                class="secondary medium"
                onClick={ () => { this.handleRetakeClick(); } }
              >No, rescan</button>
              <button
                class="primary medium"
                onClick={ () => { this.handleConfirmClick(); } }
              >Yes, continue</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  private close = (): void => {
    this.inProgress = false;
  };

  private handleConfirmClick = (): void => {
    this.config?.callbacks?.onConfirm?.({
      originalData: this.originalData,
      editedData: this.editHelper.export()
    });
    this.close();
  };

  private handleRetakeClick = (): void => {
    this.config?.callbacks?.onRepeat?.();
    this.close();
  };

  private handleCloseClick = (): void => {
    this.config?.callbacks?.onClose?.();
    this.close();
  }

  private showFullNameCase = (): boolean => {
    const { fullName } = this.originalData;
    return fullName != null && fullName.length > 0;
  };

  private showFirstLastNameCase = (): boolean => {
    return !this.showFullNameCase();
  };
}
interface PropsStringAttribute {
  label: string;
  value: string;
}

const StringAttribute = (
  props: PropsStringAttribute
): FunctionalComponent<PropsStringAttribute> => {
  return (
    <div class="attribute">
      <p class="label">
        { props.label }
      </p>
      <p class="value">
        { props.value || '-' }
      </p>
    </div>
  );
};

interface PropsImageAttribute {
  label: string;
  value: ImageData
}

const DocumentImageAttribute = (
  props: PropsImageAttribute
): FunctionalComponent<PropsImageAttribute> => {
  const { label, value } = props;
  const dataUrl = value ? buildDataUrlFromImageData(value) : '';

  return (
    <div class="attribute">
      {/* <p class="label">
        { label }
      </p> */}
      <img class="value" alt={ label } src={dataUrl} />
    </div>
  );
};

interface PropsFaceImage {
  name: string;
  imageData: ImageData;
}

const FaceImage = (
  props: PropsFaceImage
): FunctionalComponent<PropsFaceImage> => {
  const { name, imageData } = props;
  const dataUrl = imageData ? buildDataUrlFromImageData(imageData) : '';

  return (
    <img class="face-image" alt={ name } src={dataUrl} />
  );
};
