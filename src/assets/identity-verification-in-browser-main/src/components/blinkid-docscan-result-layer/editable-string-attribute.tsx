import {
  h,
  FunctionalComponent,
  Component,
  State,
  Prop
} from '@stencil/core';
import { EditableStringAttributeConfig } from './editable-string-attribute.model';

@Component({
  tag: 'editable-string-attribute',
  styleUrl: 'blinkid-docscan-result-layer.css',
  shadow: false
})
export class EditableStringAttribute  {
  @State()
  editMode = false;
  @Prop()
  value!: string;
  @Prop()
  config!: EditableStringAttributeConfig;
  private inputEl: HTMLInputElement;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    return (
      <div class="attribute">
        <p class="label">
          { this.config.label }
        </p>
        <div class="input-container">
          <input
            class="form-control"
            type="text"
            title="Editable"
            value={ this.value }
            onChange={ (event: any) => {
              event.preventDefault();
              this.config.onValueChange(event.target.value);
            } }
            onFocusout={ () => {
              this.editMode = false;
            } }
            ref={ (inputEl: HTMLInputElement) => { this.inputEl = inputEl; } }
          />
          { !this.editMode && (
            <div
              class="place-holder"
              onClick={ () => {
                this.inputEl.focus();
                this.editMode = true;
              } }
            >
              <div class="content-container">
                <div class="content">
                  { this.value || '_' }
                </div>
                <div class="edit-icon">
                  <EditIcon></EditIcon>
                </div>
              </div>
            </div>
          ) }
        </div>
      </div>
    );
  }
}

interface PropsEditIcon {
  size?: string;
}

const EditIcon = (props: PropsEditIcon): FunctionalComponent<PropsEditIcon> => {
  const size = props.size || '12px';
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={ size } height={ size } viewBox="0 0 16 16" fill="none">
      <path d="M10.1547 3.48798L12.512 5.84531M11.1547 2.48798C11.4673 2.17537 11.8912 1.99976 12.3333 1.99976C12.7754 1.99976 13.1994 2.17537 13.512 2.48798C13.8246 2.80058 14.0002 3.22456 14.0002 3.66664C14.0002 4.10873 13.8246 4.53271 13.512 4.84531L4.33333 14.024H2V11.6426L11.1547 2.48798Z" stroke="#0062F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );
};