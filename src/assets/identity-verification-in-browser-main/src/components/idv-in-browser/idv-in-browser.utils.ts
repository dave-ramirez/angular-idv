import * as packageJson from '../../../package.json';
import { VerifyServerUserAgent } from '../../dto/verify-server.dto';
import { FontConfig, loadFonts } from '../../utils/assets-resources-loading.utils';
import { VerifyServerApiClient } from '../../utils/verify-server.utils';
import { loadWasmModule, WasmSDKLoadSettings } from '@microblink/blinkid-in-browser-sdk';
import {
  getLicense as globalGetLicense,
  getResourcesDirPath as globalGetResourcesDirPath } from '../../global';
import { consoleError } from '../../utils/logging.utils';
import { getAppUrlOrigin } from '../../utils/url.utils';

export async function loadMainCss(resourcesDir: string, onLoadCallback?: () => void): Promise<void> {
  const link = document.createElement('link');
  link.onload = () => {
    onLoadCallback?.();
  };
  link.rel = 'stylesheet';
  link.href = `${resourcesDir}idv-in-browser-sdk-ui.css`;
  document.head.appendChild(link);
}

/**
 * Loads Sathosi font - default app font.
 * @param resourcesDir Publicly accessible resources directory.
 */
export async function loadSatoshiFont(resourcesDir: string, onLoadCallback?: () => void): Promise<void>  {
  // weight normal
  const fNormalNormalOft = new FontConfig(
    'Satoshi',
    `url(${resourcesDir}fonts/Satoshi/Satoshi-Regular.otf)`,
    'normal',
    'normal'
  );
  const fItalicNormalOft = new FontConfig(
    'Satoshi',
    `url(${resourcesDir}fonts/Satoshi/Satoshi-Italic.otf)`,
    'italic',
    'normal'
  );
  // weight bold
  const fNormalBoldOft = new FontConfig(
    'Satoshi',
    `url(${resourcesDir}fonts/Satoshi/Satoshi-Bold.otf)`,
    'normal',
    'bold'
  );
  const fItalicBoldOft = new FontConfig(
    'Satoshi',
    `url(${resourcesDir}fonts/Satoshi/Satoshi-BoldItalic.otf)`,
    'italic',
    'bold'
  );
  // weight light
  const fNormalLightOft = new FontConfig(
    'Satoshi',
    `url(${resourcesDir}fonts/Satoshi/Satoshi-Light.otf)`,
    'normal',
    'light'
  );
  const fItalicLightOft = new FontConfig(
    'Satoshi',
    `url(${resourcesDir}fonts/Satoshi/Satoshi-LightItalic.otf)`,
    'italic',
    'light'
  );

  await loadFonts(
    fNormalNormalOft, fItalicNormalOft,
    fNormalBoldOft, fItalicBoldOft,
    fNormalLightOft, fItalicLightOft
  );

  onLoadCallback?.();
}

/**
 * Loads Bootstrap CSS framework.
 * @param resourcesDir Publicly accessible resources directory.
 * @param onLoadCallback  Function invoked when all bootstrap resources are loaded.
 */
export function loadBootstrap(onLoadCallback?: () => void): void {
  const loadBootstrapScript = () => {
    const bootstrapScript = document.createElement('script');
    bootstrapScript.onload = () => {
      onLoadCallback();
    };
    bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js';
    bootstrapScript.type = 'module';
    bootstrapScript.async = false;
    popperScript.integrity = 'sha384-QJHtvGhmr9XOIpI6YVutG+2QOK9T+ZnN4kzFN1RtK3zEFEIsxhlmWl5/YESvpZ13';
    document.head.appendChild(bootstrapScript);
  };

  // 1. popper script
  const popperScript = document.createElement('script');
  popperScript.onload = () => {
    // 2. boostrap JS
    loadBootstrapScript();
  };
  popperScript.src = 'https://cdn.jsdelivr.net/npm/@popperjs/core@2.10.2/dist/umd/popper.min.js';
  popperScript.type = 'module';
  popperScript.async = false;
  popperScript.integrity = 'sha384-7+zCNj/IqJ95wo16oMtfsKbZ9ccEh31eOz1HGyDuCQ6wgnyJNSYdrPa03rtR1zdB';
  document.head.appendChild(popperScript);
}

export function getSdkVersion(): string {
  return packageJson.version;
}

export async function calcAndSetVerifyServerUserAgent(): Promise<void> {
  const thisSdkVersion = getSdkVersion();
  const missingValue = '-';

  try {
    // 1. get blinkid product info
    const blinkidLicence = globalGetLicense();
    const resourcesDirPath = globalGetResourcesDirPath();
    const loadSettings = new WasmSDKLoadSettings(blinkidLicence);
    loadSettings.engineLocation = `${getAppUrlOrigin()}${resourcesDirPath}blinkID/`;
    const blinkIdEngine = await loadWasmModule(loadSettings);
    const blinkIdProductInfo = await blinkIdEngine.getProductIntegrationInfo();
    // 2. build verify server user agent
    const verifyServerUserAgent: VerifyServerUserAgent = {
      identityVerification: {
        clientInstallationId: missingValue,
        clientSdkVersion: thisSdkVersion
      },
      blinkId: {
        userId: blinkIdProductInfo.userId || missingValue,
        sdkVersion: blinkIdProductInfo.productVersion || missingValue,
        sdkPlatform: blinkIdProductInfo.platform || missingValue,
      }
    };
    // 3. save verify server user agent
    VerifyServerApiClient.setVerifyServerUserAgent(JSON.stringify(verifyServerUserAgent));
  } catch (err) {
    consoleError('calcAndSetVerifyServerUserAgent ERORR');
  }
}
