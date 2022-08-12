import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

//import { defineCustomElements } from '@microblink/idv-in-browser-sdk/loader';
import { defineCustomElements } from '../node_modules/@microblink/blinkid-in-browser-sdk/ui/loader';


if (window.navigator.userAgent.toLowerCase().indexOf('iphone') > 0 && environment.production) {
  const deviceReady = () => {
    bootstrapAngular();
    document.removeEventListener('deviceReady', deviceReady);
  };
  document.addEventListener('deviceReady', deviceReady);
} else {
  bootstrapAngular();
}

function bootstrapAngular() {
  if (environment.production) {
    enableProdMode();
  }

  defineCustomElements();
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
}
