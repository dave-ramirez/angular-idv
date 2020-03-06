import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

/**
 * Para webviews no iOS, existe a necessidade de iniciar a execução da
 * aplicação Angular após o evento "deviceReady", emitido pelo SDK Nativo.
 * Dessa forma, é garantida a disponibilidade do objeto native no
 * escopo global da webview, permitindo a execução de funções do SDK.
 */
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

  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
}
