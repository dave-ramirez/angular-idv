/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */
import { Component, Element, Event, Host, h, Prop } from '@stencil/core';
import { setWebComponentParts, classNames } from '../../../utils/generic.helpers';
export class MbModal {
  constructor() {
    /**
     * Show modal content
     */
    this.visible = false;
    /**
     * Passed title content from parent component
     */
    this.modalTitle = "";
    /**
     * Passed body content from parent component
     */
    this.content = "";
    /**
     * Center content inside modal
     */
    this.contentCentered = true;
  }
  connectedCallback() {
    setWebComponentParts(this.hostEl);
  }
  render() {
    return (h(Host, { className: classNames({ visible: this.visible }) },
      h("div", { class: "mb-modal" },
        h("div", { class: "close-wrapper" },
          h("div", { class: "close-icon", onClick: () => this.close.emit() },
            h("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
              h("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M15.5896 4.4107C15.915 4.73614 15.915 5.26378 15.5896 5.58922L5.58958 15.5892C5.26414 15.9147 4.73651 15.9147 4.41107 15.5892C4.08563 15.2638 4.08563 14.7361 4.41107 14.4107L14.4111 4.4107C14.7365 4.08527 15.2641 4.08527 15.5896 4.4107Z", fill: "#3C3C43", "fill-opacity": "0.5" }),
              h("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M4.41107 4.4107C4.73651 4.08527 5.26414 4.08527 5.58958 4.4107L15.5896 14.4107C15.915 14.7361 15.915 15.2638 15.5896 15.5892C15.2641 15.9147 14.7365 15.9147 14.4111 15.5892L4.41107 5.58922C4.08563 5.26378 4.08563 4.73614 4.41107 4.4107Z", fill: "#3C3C43", "fill-opacity": "0.5" })))),
        h("div", { class: "title" }, this.modalTitle),
        h("div", { class: this.contentCentered ? 'centered' : '' }, this.content),
        h("div", { class: "actions" },
          h("slot", { name: "actionButtons" })))));
  }
  static get is() { return "mb-modal"; }
  static get encapsulation() { return "shadow"; }
  static get originalStyleUrls() { return {
    "$": ["mb-modal.scss"]
  }; }
  static get styleUrls() { return {
    "$": ["mb-modal.css"]
  }; }
  static get properties() { return {
    "visible": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "boolean",
        "resolved": "boolean",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "Show modal content"
      },
      "attribute": "visible",
      "reflect": false,
      "defaultValue": "false"
    },
    "modalTitle": {
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
        "text": "Passed title content from parent component"
      },
      "attribute": "modal-title",
      "reflect": false,
      "defaultValue": "\"\""
    },
    "content": {
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
        "text": "Passed body content from parent component"
      },
      "attribute": "content",
      "reflect": false,
      "defaultValue": "\"\""
    },
    "contentCentered": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "boolean",
        "resolved": "boolean",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "Center content inside modal"
      },
      "attribute": "content-centered",
      "reflect": false,
      "defaultValue": "true"
    }
  }; }
  static get events() { return [{
      "method": "close",
      "name": "close",
      "bubbles": true,
      "cancelable": true,
      "composed": true,
      "docs": {
        "tags": [],
        "text": "Emitted when user clicks on 'X' button."
      },
      "complexType": {
        "original": "void",
        "resolved": "void",
        "references": {}
      }
    }]; }
  static get elementRef() { return "hostEl"; }
}
