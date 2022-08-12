/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */
import { Component, Element, Event, Host, h, Prop } from '@stencil/core';
import { setWebComponentParts, classNames } from '../../../utils/generic.helpers';
export class MbButtonClassic {
  constructor() {
    /**
     * Set to 'true' if button should be disabled, and if click events should not be triggered.
     */
    this.disabled = false;
    /**
     * Set to 'true' if default event should be prevented.
     */
    this.preventDefault = false;
  }
  handleClick(ev) {
    if (this.preventDefault) {
      ev.preventDefault();
    }
    if (this.disabled) {
      ev.stopPropagation();
      return;
    }
    this.buttonClick.emit(ev);
  }
  connectedCallback() {
    setWebComponentParts(this.hostEl);
  }
  render() {
    return (h(Host, { className: classNames({ disabled: this.disabled }), onClick: (ev) => this.handleClick(ev) },
      h("a", { href: "javascript:void(0)" },
        h("slot", null))));
  }
  static get is() { return "mb-button-classic"; }
  static get encapsulation() { return "shadow"; }
  static get originalStyleUrls() { return {
    "$": ["mb-button-classic.scss"]
  }; }
  static get styleUrls() { return {
    "$": ["mb-button-classic.css"]
  }; }
  static get properties() { return {
    "disabled": {
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
        "text": "Set to 'true' if button should be disabled, and if click events should not be triggered."
      },
      "attribute": "disabled",
      "reflect": false,
      "defaultValue": "false"
    },
    "preventDefault": {
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
        "text": "Set to 'true' if default event should be prevented."
      },
      "attribute": "prevent-default",
      "reflect": false,
      "defaultValue": "false"
    }
  }; }
  static get events() { return [{
      "method": "buttonClick",
      "name": "buttonClick",
      "bubbles": true,
      "cancelable": true,
      "composed": true,
      "docs": {
        "tags": [],
        "text": "Event which is triggered when user clicks on button element. This event is not triggered\nwhen the button is disabled."
      },
      "complexType": {
        "original": "UIEvent",
        "resolved": "UIEvent",
        "references": {
          "UIEvent": {
            "location": "global"
          }
        }
      }
    }]; }
  static get elementRef() { return "hostEl"; }
}
