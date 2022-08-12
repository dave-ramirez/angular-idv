/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */
import { Component, Element, Host, h, Prop } from '@stencil/core';
import { setWebComponentParts } from '../../../utils/generic.helpers';
export class MbSpinner {
  constructor() {
    /**
     * Value of `src` attribute for <img> element.
     */
    this.icon = 'data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle opacity="0.33" cx="12" cy="12" r="10" stroke="%2348B2E8" stroke-width="4"/><path d="M2 12C2 6.47715 6.47715 2 12 2" stroke="%2348B2E8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    /**
     * Spinner size, can be 'default' or 'large'.
     */
    this.size = 'default';
  }
  connectedCallback() {
    setWebComponentParts(this.hostEl);
  }
  render() {
    return (h(Host, { className: this.size },
      h("img", { src: this.icon })));
  }
  static get is() { return "mb-spinner"; }
  static get encapsulation() { return "shadow"; }
  static get originalStyleUrls() { return {
    "$": ["mb-spinner.scss"]
  }; }
  static get styleUrls() { return {
    "$": ["mb-spinner.css"]
  }; }
  static get properties() { return {
    "icon": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "Value of `src` attribute for <img> element."
      },
      "attribute": "icon",
      "reflect": false,
      "defaultValue": "'data:image/svg+xml;utf8,<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><circle opacity=\"0.33\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"%2348B2E8\" stroke-width=\"4\"/><path d=\"M2 12C2 6.47715 6.47715 2 12 2\" stroke=\"%2348B2E8\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>'"
    },
    "size": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "Spinner size, can be 'default' or 'large'."
      },
      "attribute": "size",
      "reflect": false,
      "defaultValue": "'default'"
    }
  }; }
  static get elementRef() { return "hostEl"; }
}
