/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */
import { Component, Element, Event, Host, h, Prop, State } from '@stencil/core';
import { setWebComponentParts, classNames } from '../../../utils/generic.helpers';
export class MbButton {
  constructor() {
    /**
     * Set to 'true' if button should be disabled, and if click events should not be triggered.
     */
    this.disabled = false;
    /**
     * Set to 'true' if button contains an icon.
     */
    this.icon = false;
    /**
     * Set to 'true' if default event should be prevented.
     */
    this.preventDefault = false;
    /**
     * Set to 'true' if button should be visible.
     */
    this.visible = false;
    /**
     * Set to 'true' if button should enter 'selected' state.
     */
    this.selected = false;
    /**
     * Passed image from parent component.
     */
    this.imageSrcDefault = '';
    /**
     * Passed image from parent component.
     */
    this.imageSrcActive = '';
    /**
     * Passed description text for image element from parent component.
     */
    this.imageAlt = '';
    /**
     * Set to string which should be displayed below the icon.
     *
     * If omitted, nothing will show.
     */
    this.label = '';
    this.imageSrc = this.imageSrcDefault;
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
  handleMouseOver() {
    if (!this.disabled) {
      this.imageSrc = this.imageSrcActive;
    }
  }
  handleMouseOut() {
    if (!this.disabled) {
      this.imageSrc = this.imageSrcDefault;
    }
  }
  connectedCallback() {
    setWebComponentParts(this.hostEl);
  }
  render() {
    return (h(Host, { className: classNames({ visible: this.visible, disabled: this.disabled, icon: this.icon, selected: this.selected }), onClick: (ev) => this.handleClick(ev) },
      h("a", { onMouseOver: this.handleMouseOver.bind(this), onMouseOut: this.handleMouseOut.bind(this), href: "javascript:void(0)" },
        this.imageSrcDefault && this.imageAlt === 'action-alt-camera' &&
          h("img", { src: this.imageSrc, alt: this.translationService.i(this.imageAlt).toString() }),
        this.imageSrcDefault && this.imageAlt === 'action-alt-gallery' &&
          h("label", { htmlFor: "scan-from-image-input" },
            h("img", { src: this.imageSrc, alt: this.translationService.i(this.imageAlt).toString() }))),
      this.label !== '' &&
        h("span", null, this.label)));
  }
  static get is() { return "mb-button"; }
  static get encapsulation() { return "shadow"; }
  static get originalStyleUrls() { return {
    "$": ["mb-button.scss"]
  }; }
  static get styleUrls() { return {
    "$": ["mb-button.css"]
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
    "icon": {
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
        "text": "Set to 'true' if button contains an icon."
      },
      "attribute": "icon",
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
    },
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
        "text": "Set to 'true' if button should be visible."
      },
      "attribute": "visible",
      "reflect": false,
      "defaultValue": "false"
    },
    "selected": {
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
        "text": "Set to 'true' if button should enter 'selected' state."
      },
      "attribute": "selected",
      "reflect": false,
      "defaultValue": "false"
    },
    "imageSrcDefault": {
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
        "text": "Passed image from parent component."
      },
      "attribute": "image-src-default",
      "reflect": false,
      "defaultValue": "''"
    },
    "imageSrcActive": {
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
        "text": "Passed image from parent component."
      },
      "attribute": "image-src-active",
      "reflect": false,
      "defaultValue": "''"
    },
    "imageAlt": {
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
        "text": "Passed description text for image element from parent component."
      },
      "attribute": "image-alt",
      "reflect": false,
      "defaultValue": "''"
    },
    "label": {
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
        "text": "Set to string which should be displayed below the icon.\n\nIf omitted, nothing will show."
      },
      "attribute": "label",
      "reflect": false,
      "defaultValue": "''"
    },
    "translationService": {
      "type": "unknown",
      "mutable": false,
      "complexType": {
        "original": "TranslationService",
        "resolved": "TranslationService",
        "references": {
          "TranslationService": {
            "location": "import",
            "path": "../../../utils/translation.service"
          }
        }
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "Instance of TranslationService passed from root component."
      }
    }
  }; }
  static get states() { return {
    "imageSrc": {}
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
