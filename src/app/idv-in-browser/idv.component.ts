import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';

// Import typings for the UI component
import '@microblink/idv-in-browser-sdk';

// Import typings for custom data models
//import { IdvInBrowserConfig, IdvInBrowserResult } from '@microblink/idv-in-browser-sdk;';
import { IdvInBrowserConfig, IdvInBrowserResult } from './../../../node_modules/@microblink/idv-in-browser-sdk/src/';


@Component({
  selector: 'idv-in-browser',
  template: '<idv-in-browser #idv></idv-in-browser>'
})
export class IdvInBrowserComponent implements AfterViewInit {
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
        console.log('result', ev.detail);
      }
    );
  }
}
