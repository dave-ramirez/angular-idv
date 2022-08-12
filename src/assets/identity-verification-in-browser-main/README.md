# Identity Verification In-browser SDK

Identity Verification In-browser SDK lets you verify end-users by simply asking them to scan their ID and take a selfie. Modern UX creates an intuitive and frictionless experience from beginning to end. The only thing an end-user needs is a device with a front-facing camera capable of running a web browser. 

If you want to jump right in and get info on how to install Identity Verification In-browser SDK into your web app, read the [instructions](#integration) below. Make sure you read the latest CHANGELOG.md file to see the most recent changes and improvements.

> In this documentation, "Identity Verification In-browser SDK" might get refered to as "IDV SDK" or just "SDK".

## Coding overview
If we skip the installation for now, coding comes down to just a few simple steps.
```
<!-- 1. load core script -->
<script type="module" src="assets/resources/idv/index.js"></script>
<script nomodule src="assets/resources/idv/index.cjs.js"><script>

<!-- 2. insert component -->
<idv-in-browser id="idv"></idv-in-browser>

<script>
  // 3. get component reference
  const idvElement = document.getElementById("idv");
  // 4. pass configuration
  idvElement.config = {
    license: "...",
    identityVerificationServerUrl: "...",
    resourcesDirectoryPath: "assets/resources/"
  };
  // 5. define result listener
  idvElement.addEventListener('result', (customEvent) => {
    const result = customEvent.details;
    // result: IdvInBrowserResult
  });
</script>
```

## Table of contents

* [Components of SDK](#components-of-sdk)
  * [Web Component](#web-component)
  * [Dependencies and modules](#dependencies-and-modules)
* [Integration](#integration)
  * [Install SDK as an NPM package](#optional-install-sdk-as-an-npm-package)
  * [Expose SDK's resources](#expose-sdks-resources)
  * [Load SDK's core JavaScript module](#load-sdks-core-javascript-module)
  * [Insert Web Component into your HTML](#insert-web-component-into-your-html)
  * [Configure the inserted Web Component](#configure-the-inserted-web-component)
* [Integration prerequisites](#integration-prerequisites)
  * [Identity Verification Server](#identity-verification-server)
  * [Obtain a license key](#obtain-a-license-key)
* [Web Component API](#web-component-api)
  * [Properties](#properties)
  * [Events](#events)
  * [Methods](#methods)
  * [Data models](#data-models)
    * [IdvInBrowserConfig](#idvinbrowserconfig)
    * [IdvInBrowserResult](#idvinbrowserresult)
* [Identity Verification Results](#identity-verification-results)
* [JS frameworks integration](#js-frameworks-integration)
  * [Angular 2+](#angular-2)
  * [ReactJS](#reactjs)
* [Technical Requirements](#technical-requirements)
  * [Supported Browsers](#supported-browsers)
* [Appendix](#appendix)
  * [Identity Verification product](#identity-verification-product)
  * [Identity Verification Dashboard](#identity-verification-dashboard)

## Components of SDK

### 1. Web Component

Identity Verification In-browser SDK features a UI web component prebuilt as a [HTML5 Custom Element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).

The component consists of a minimal-footprint-inline-block landing view which offers one user an option to open a full-screen main view in a fixed layer on top of your application.

In the focus of a full-screen main view is a flow manager which navigates the user through the steps they need to take to verify their identity: 

1. Scan their government-issued identity document (ID card, passport or another type)
2. Take a 'selfie' by showing the camera to their face and bringing it closer 

UI has an advanced error recovery mechanism. For any kind of error that might occur in the process, the UI will offer end-user an option to recover from it (via error messages and real-time feedback).

### 2. Dependencies and modules

While going through the process of identity verification, multiple server requests are made towards the [Identity Verification Server](#identity-verification-server). Connection to the server is a must and a server URL must be provided in the main [configuration](#configure-the-inserted-web-component) object passed to the Web Component. More about the Identity Verification Server and other prerequisites can be found [here](#integration-prerequisites).

Besides the Identity Verification Server access module, the SDK uses the following modules as well:

1. **BlinkID SDK** for ID scanning and ID data extraction.
1. **FaceTecSDK** for selfie extraction, liveness detection and face matching.

## Integration

Before installing, please check the [prerequisites](#integration-prerequisites) list and make sure that all the conditions are met.

On a high-level, integration is done by completing these steps:

1. (optional) Install SDK as an NPM package.
1. Expose SDK's resources.
1. Load SDK's core JavaScript module.
1. Integrate Web Component into your HTML.
1. Configure the inserted Web Component.

### (Optional) Install SDK as an NPM package

> Your web application might not be using NPM as a package manager, or any package manager at all. If that's the case, skip this section.

Identity Verification In-browser SDK is not a part of the [NPM registry](https://docs.npmjs.com/cli/v8/using-npm/registry), but it is built as an NPM package. This means that SDK can be installed in your web application as a local NPM dependency.

The benefits of an NPM integration will be best visible if your app is written in Typescript - IDV SDK exposes types (interfaces, classes) of the SDK API's data models. This will make your integration process faster and reduce unexpected errors. More info on the API's data models can be found [here](#web-component-api).

### Expose SDK's resources
This repository contains a **"resources"** folder which holds scripts, images, icons, styles, fonts, WASM files and other dependencies needed for the SDK to work properly.

> "resources" folder is located in the root folder of this repository (same as this README.md file).

Make sure to include this directory in your distribution. You can either copy the entire directory or just its contents into your distribution.

**Important:** Instead of adding the folder to the main app bundle, place it on a publicly available locations so that the SDK can load it at an appropriate time. For example, place the resources in `my-angular-app/src/assets/` folder if integrating into the Angular2+ application or in `my-react-app/public/` folder if integrating into the ReactJS application.

The file path of a directory holding the SDK's resources can be any, as long as it is publicly accessible, since it can easily be configured as a part of the Web Component's [configuration](#configure-the-inserted-web-component).

#### Example

Let's say that this SDK's "resources" folder has this file hierarchy:
```
resources/
  res_folder_A/
  res_folder_B/
  res_file_1
  res_file_2
```
and there is a publicly-available folder in your application at the following path and with the following content:
```
my-react-app/public/
  my_folder_A/
  my_file_1
```
There are two ways you can copy the SDK's resources to your application:
1. Copy whole "resources" folder (as a unit, with its contents) into your public folder like so: 
    ```
    my-react-app/public/
      my_folder_A/
      my_file_1
      resources/
        res_folder_A
        res_folder_B
        res_file_1
        res_file_2
    ```
    and have the resources file path specified as `my-react-app/public/resources/`.
    
    You can even rename the "resources" folder to something like "idv_resources" once you've copied it:
    ```
    my-react-app/public/
      my_folder_A/
      my_file_1
      idv_resources/
        res_folder_A
        res_folder_B
        res_file_1
        res_file_2
    ```
    but don't forget that the resources file path will then become `my-react-app/public/idv_resources/`.
1. You can also copy the contents of the "resources" folder into your public folder like so:
    ```
    my-react-app/public/
      my_folder_A/
      my_file_1
      res_folder_A/
      res_folder_B/
      res_file_1
      res_file_2
    ```
    and have the resources file path specified as `my-react-app/public/`.

We suggest having IDV SDK's resources contained in a separate folder ([see option 1](#copy-whole-resources-folder)) to keep the file hierarchy cleaner.

> Summary: the configured path to the copied resources is a path to the folder containing resources and not a path to the parent folder which holds the "resources" folder.

### Load SDK's core JavaScript module

Include the SDK's core JavaScript files in your `index.html`:
```
<script type="module" src="assets/resources/idv/index.js"></script>
<script nomodule src="assets/resources/idv/index.cjs.js"><script>
```
where `assets/resources/` is the path you've copied the resources to, and `idv/index.js` is a fixed path inside IDV SDK's resources. To stay compatible with older browsers, a core CommonJS script will loaded as needed.

> If your application uses NPM package manager and Javascript modules you can load SDK's core script by simply having the `import "@microblink/idv-in-browser-sdk"` in your operating module.

### Insert Web Component into your HTML

IDV SDK's Web Component has a tag/selector of `idv-in-browser`. Insert it into HTML as shown below:
```
<body>
  <idv-in-browser id="idv"></idv-in-browser>
</body>
```
You can insert it anywhere in your application's DOM. For example:
```
<body>
  <div class="some-div">
    <idv-in-browser id="idv"></idv-in-browser>
  </div>
</body>
```

### Configure the inserted web component

Complete documentation for the configuration object passed to the Web Component can be found [here](#properties). To sum up, there are 3 mandatory configuration attributes:

1. license ([how to get it?](#obtain-a-license-key))
1. identityVerificationServerUrl ([how to get it?](#identity-verification-server))
1. resourcesDirectoryPath

If your app does not use any modern web framework which offers HTML interpolation, then you can pass the configuration object to the Web Component like this:
```
<script>
  const idvElement = document.getElementById("idv");
  idvElement.config = {
    license: "...",
    identityVerificationServerUrl: "...",
    resourcesDirectoryPath: "assets/resources/"
  };
</script>
```
On the other hand, if there is some interpolation mechanism, and syntax is `{ interpolated_var }` (like in ReactJS for example), then you can pass the configuraiton object in-line like this:
```
<idv-in-browser
  id="idv"
  config= {
    {
      license: "...",
      identityVerificationServerUrl: "...",
      resourcesDirectoryPath: "assets/resources/"
    }
  }
></idv-in-browser>
```

> For the config to be valid, both the `identityVerificationServerUrl` and `resourcesDirectoryPath` string attributes must end with a forward slash character - "`/`".

## Integration prerequisites

1. Have Identity Verification Server up, running and accessible.
1. Obtain a license key.

### Identity Verification Server

More info on setting the server up can be found [here](https://microblink.gitbook.io/identity-verification/starting-trial).

### Obtain a license key

Identity Verification In-browser SDK license requires a valid BlinkID license to work as ID document scanning is an integral part of the SDK.

You can obtain a free trial license key by registering to [Microblink's developer hub](https://developer.microblink.com/doc/blink-id). After registering, you will be able to generate a license key for your web app.

Make sure you enter a fully qualified domain name of your web app when filling out the form — the license key will be bound to it. Also, if you plan to serve your web app from different domains, you'll need a license key for each one.

Keep in mind: Identity Verification In-browser SDK requires an internet connection to work under our new License Management Program.

This means your web app has to be connected to the Internet in order for us to validate your trial license key. Scanning or data extraction of documents still happens offline, in the browser itself.

Once the validation is complete, you can continue using the SDK in an offline mode (or over a private network) until the next check.

We've added error callback to Microblink SDK to inform you about the status of your license key.

## Web Component API

### Properties

| Property  | Attribute | Description | Type  | Default | Required |
| --- | --- | --- | --- | --- | --- |
| config | config | Configuration object holding both the mandatory and optional attributes needed for a Web Component to work. | [IdvInBrowserConfig](#idvinbrowserconfig) | null | YES |

### Events

| Event | Description | Type |
| --- | --- | --- |
| result | Identity verification process result (enumeration). More detailed info on results can be found [here](#identity-verification-results). | CustomEvent\<[IdvInBrowserResult](#idvinbrowserresult)> |
| session-initialized | Emitted when new verification session is initialized. Value being emitted is session id. | CustomEvent\<string> |

### Methods

| Method | Description | Type |
| --- | --- | --- |
| restart | When invoked it restarts the whole Identity Verification process (new session). | async function(): Promise\<void> |

### Data models

#### IdvInBrowserConfig
```
interface IdvInBrowserConfig {
  license: string;
  identityVerificationServerUrl: string;
  resourcesDirectoryPath: string;
  docscanSkipUnsupportedBack?: boolean;
}
```

#### IdvInBrowserResult
```
enum IdvInBrowserResult {
  ERROR_CONFIG = 'ERROR_CONFIG',
  ERROR_BROWSER_SUPPORT = 'ERROR_BROWSER_SUPPORT',
  ERROR_NETWORK = 'ERROR_NETWORK',
  ERROR = 'ERROR',

  VERIFIED = 'VERIFIED',
  NOT_VERIFIED = 'NOT_VERIFIED',
  NEEDS_REVIEW = 'NEEDS_REVIEW'
}
```

## Identity Verification Results

Results consists of both (1) error results and (2) final identity verification results. These are returned by the Web Component as a "result" event which can be caught in your web application by specifying an event listener for it.

To learn how to specify a result event listener see the [Vanilla Javascript Example](#vanilla-javascript-example) section.

> There is only one result returned as part of one verification session.

> No matter what kind of result you get (error or final-verification), you can always [programmatically restart your flow](#methods).

List of results and their triggers:

1. `ERROR_CONFIG` 
    1. License is invalid or expired.
    1. Resources directory path is invalid.
    1. Identity Verification Server ping fails.
1. `ERROR_BROWSER_SUPPORT`
    1. Browser not supported (might not have WASM support).
1. `ERROR_NETWORK`
    1. Network error occurred and end-user did not want to use SDK's troubleshooting mechanism.
1. `ERROR`
    1. Unknown/unexpected error occurred.
1. `VERIFIED`
    1. Identity verification finished and succeeded.
1. `NOT_VERIFIED`
    1. Identity verification finished and failed.
1. `NEEDS_REVIEW`
    1. Identity verification finished and needs additional review. More about additional review can be found [here](#identity-verification-dashboard).

## JS frameworks integration

In the sections so far this technical documentation had it's primary focus on the, so called, Vanilla JavaScript integration. If your application is powered by one of the modern JavaScript frameworks, like Angular2+ or ReactJS, integration might differ in one or two aspects.

### Angular 2+

1. Install IDV SDK as a local NPM dependency with `npm install --save src/dependencies/idv-in-browser`, where `src/dependencies/idv-in-browser` is a path to the IDV SDK package inside your application.

1. Setup Angular to automatically copy IDV SDK's resources to public location. Add the following code to `angular.json` inside `projects.<projectName>.architect.build.options.assets` array:
    ```
    {
      "glob": "**/*",
      "input": "node_modules/@microblink/idv-in-browser-sdk/resources",
      "output": "/idv-resources/"
    }
    ```

1. Add `CUSTOM_ELEMENTS_SCHEMA` to `app.module.ts` (or main application module) to allow usage of custom HTML elements.

1. Call `defineCustomElements()` in `main.ts`:
    ```
    import { defineCustomElements } from '@microblink/idv-in-browser-sdk/loader';

    ...

    defineCustomElements();
    ```

1. Here's one possible way to use `<idv-in-browser>` custom web component inside Angular:
    ```
    import {
      AfterViewInit,
      Component,
      ElementRef,
      ViewChild
    } from '@angular/core';

    // Import typings for the UI component
    import '@microblink/idv-in-browser-sdk';

    // Import typings for custom data models
    import {
      IdvInBrowserConfig,
      IdvInBrowserResult
    } from '@microblink/idv-in-browser-sdk;

    @Component({
      selector: 'my-component',
      template: '<idv-in-browser #idv></idv-in-browser>',
      styleUrls: ['./my-component.component.scss']
    })
    export class MyComponent implements AfterViewInit {
      // Reference to the `idv-in-browser` custom web component
      @ViewChild('idv') idv!: ElementRef<HTMLIdvInBrowserElement>;

      constructor() {}

      ngAfterViewInit(): void {
        const idvConfig: IdvInBrowserConfig = {
          license: '<PLACE-YOUR-LICENSE-KEY-HERE>',
          identityVerificationServerUrl: '<PLACE-YOUR-URL-HERE>',
          resourcesDirectoryPath: 'assets/idv-resources/'
        }

        this.idv.nativeElement.config = idvConfig;

        this.idv.nativeElement.addEventListener(
          'result',
          (ev: CustomEventInit<IdvInBrowserResult>) => {
            console.log('result', ev.details);
          }
        );
      }
    }
    ```

### ReactJS

1. Install IDV SDK as a local NPM dependency with `npm install --save src/dependencies/idv-in-browser`, where `src/dependencies/idv-in-browser` is a path to the IDV SDK package inside your application.

1. Copy resources to your application's public location. This is one possible approach:
    ```
    # Auxiliary tool for cross-platform support
    $ npm install --save-dev shx
    ```
    ```
    # Add `postinstall` hook to `package.json` that will copy resources
    {
        ...
        "scripts": {
            ...
            "postinstall": "shx cp -r node_modules/@microblink/idv-in-browser-sdk/resources public"
            ...
        },
        ...
    }
    ```

1. Here's one possible way to use `<idv-in-browser>` custom web component inside ReactJS:
    ```
    import React from 'react';

    import {
      applyPolyfills,
      defineCustomElements
    } from '@microblink/idv-in-browser-sdk/loader';

    function App() {
      // Reference to the `<idv-in-browser>` custom web component
      const el = React.useRef(null);

      React.useEffect(() => {
        applyPolyfills().then(() => {
          defineCustomElements().then(() => {
            el.current.config = {
              license: '<PLACE-YOUR-LICENSE-KEY-HERE>',
              identityVerificationServerUrl: '<PLACE-YOUR-URL-HERE>',
              resourcesDirectoryPath: 'resources/'
            }

            el.current.addEventListener('result', (ev) => {
              console.log('result', ev.details);
            });
          });
        });
      }, []);

      return (
        <idv-in-browser ref={el}></idv-in-browser>
      );
    }

    export default App;
    ```

## Technical Requirements

This section provides information about technical requirements of end-user devices to run Identity Verification In-browser.

1. Device has a front-facing camera with a minimum resolution of 720p.
1. The browser is [supported](#supported-browsers). Latest versions of Chrome, Safari, Firefox and Edge.
1. The browser has access to device's camera.

**Important**:
> IDV SDK may not work correctly in WebView/WKWebView/SFSafariViewController.

> SDK cannot access camera on iOS 14.2 and older versions when the end-user is using a web browser other than Safari. Apple does not allow access to camera via WebRTC specification for other browsers.

### Supported browsers

| Chrome  | Chrome<br><small>Android</small>  | Chrome<br><small>iOS</small>  | Firefox | Firefox<br><small>Android</small> | Firefox<br><small>iOS</small> |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 57 | 86 | 87 |  52 | 82 | 30 |

| Safari | Safari<br><small>iOS</small>| Edge | IE | Opera |
| :---: | :---: | :---: | :---: | :---: |
| 11 | 14 | 79 | - | - |

> Internet Explorer and Opera are not supported.

## Appendix

### About Identity Verification

[Identity Verification](https://microblink.gitbook.io/identity-verification) is an end-to-end solution for verifying users remotely on iOS, Android and in-browser. This documentation showed you how to integrate it in your web app.


### Identity Verification Dashboard

 [Identity Dashboard](https://microblink.gitbook.io/identity-verification/identity-dashboard) is a central place for you and your team members to track and manage user verifications in one place. It is not a part of this SDK, but is available as a part of the Microblink's Identity Verification product.

### About Microblink

[Microblink](http://microblink.com) creates intelligent and easy-to-use AI solutions that make any member experience magical. Our technology is already a part of some of the world’s leading mobile and web apps, where it’s used to optimize customer experience and reduce fraud.