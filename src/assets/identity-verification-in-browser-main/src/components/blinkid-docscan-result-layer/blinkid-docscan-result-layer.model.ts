import { BlinkIdCombinedRecognizerResult } from '@microblink/blinkid-in-browser-sdk';

/**
 * BlinkID scan result attributes which can be edited.
 */
export enum BidResultEditableAttr {
  fullName = 'fullName',
  firstName = 'firstName',
  lastName = 'lastName',
  address = 'address',
}

/**
 * Edited BlinkID scan result attributes (in exchangeable format).
 */
export type BlinkIdResultEditedData = Partial<Record<BidResultEditableAttr, string>>;

/**
 * BlinkID scan result value edit record.
 */
export interface BidResultEditedValue {
  originalValue: string;
  editedValue?: string;
}

/**
 * Controls a process of BlinkID result attributes values editing.
 */
export class BidResultEditHelper {
  /**
   * Map of all the editable attributes and value edits done to attributes.
   */
  private editedMap: Map<BidResultEditableAttr, BidResultEditedValue>;

  /**
   * Instatiates new BidResultEditHelper.
   * @param originalData Original BlinkID result object. Used to init map of edited attribute values.
   */
  constructor(originalData: BlinkIdCombinedRecognizerResult) {
    this.editedMap = new Map<BidResultEditableAttr, BidResultEditedValue>();
    // fullName
    this.editedMap.set(
      BidResultEditableAttr.fullName,
      { originalValue: originalData.fullName }
    );
    // firstName
    this.editedMap.set(
      BidResultEditableAttr.firstName,
      { originalValue: originalData.firstName }
    );
    // lastName
    this.editedMap.set(
      BidResultEditableAttr.lastName,
      { originalValue: originalData.lastName }
    );
    // address
    this.editedMap.set(
      BidResultEditableAttr.address,
      { originalValue: originalData.address }
    );
  }

  /**
   * Gets attribute's original value.
   * @param attr BlinkID result attribute name.
   * @returns Original value.
   */
  public getOriginalValue(attr: BidResultEditableAttr): string {
    const storedEdit = this.editedMap.get(attr);
    return storedEdit.originalValue;
  }

  /**
   * Gets attribute's edited value.
   * @param attr BlinkID result attribute name.
   * @returns Edited value.
   */
  public getEditedValue(attr: BidResultEditableAttr): string {
    const storedEdit = this.editedMap.get(attr);
    if (!storedEdit) { return null; }
    return storedEdit.editedValue;
  }

  /**
   * Get's attributes latest value - edited if exists or original otherwise.
   * @param attr BlinkID result attribute name.
   * @returns Latest value.
   */
  public getValue(attr: BidResultEditableAttr): string {
    const storedEdit = this.editedMap.get(attr);
    if (storedEdit == null) { return null; }
    const { editedValue, originalValue } = storedEdit;
    if (editedValue != null) { return editedValue; }
    return originalValue;
  }

  /**
   * Applies value edit to one attribute.
   * It can either set a new edited value that is different than original,
   * or can reset value if it's the same as the original value.
   * @param attr BlinkID result attribute name.
   * @param newValue New value.
   * @returns TRUE if value did change (new or reset) or FALSE if value did not change.
   */
  public applyEdit(attr: BidResultEditableAttr, newValue: string): boolean {
    if (!this.editedMap.has(attr)) {
      return false;
    }

    const storedEdit = this.editedMap.get(attr);
    const cnnzdNewValue = newValue.toLowerCase();
    const cnnzdOriginalValue = storedEdit.originalValue.toLowerCase();
    const cnnzdOldEditedValue = storedEdit.editedValue?.toLowerCase();

    if (cnnzdNewValue === cnnzdOriginalValue) {
      storedEdit.editedValue = null;
      return true;
    }
    else if (cnnzdNewValue !== cnnzdOriginalValue && cnnzdNewValue !== cnnzdOldEditedValue) {
      storedEdit.editedValue = cnnzdNewValue.toUpperCase();
      return true;
    }

    if (storedEdit.editedValue) {
      storedEdit.editedValue = storedEdit.editedValue.toUpperCase();
    }

    return false;
  }

  /**
   * @returns Edited attributes in excangeable format.
   */
  public export(): BlinkIdResultEditedData {
    const dataToExport: BlinkIdResultEditedData = {};
    const keysIterator = this.editedMap.keys();

    let iteration = keysIterator.next();
    while (!iteration.done) {
      const { value: attr } = iteration;
      const { editedValue } = this.editedMap.get(attr);
      if (editedValue != null) {
        dataToExport[attr] = editedValue;
      }

      iteration = keysIterator.next();
    }

    return dataToExport;
  }
}

/**
 * BlinkIdResultLayer component config.
 */
export interface BlinkIdDocScanResultLayerConfig {
  callbacks: {
    onClose: () => void;
    onReject: () => void;
    onConfirm: (data: BlinkIdDocScanResultLayerConfirmData) => void;
    onRepeat: () => void;
  }
}

/**
 * BlinkIDResultLayer component's @Event()confirm data.
 */
export interface BlinkIdDocScanResultLayerConfirmData {
  originalData: BlinkIdCombinedRecognizerResult;
  editedData: BlinkIdResultEditedData
}