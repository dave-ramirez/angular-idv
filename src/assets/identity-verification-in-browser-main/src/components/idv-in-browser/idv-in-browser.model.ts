
/**
 * Identity Verification web component's process result.
 */
export enum IdvInBrowserResult {
  /**
   * Provided invalid config params.
   */
  ERROR_CONFIG = 'ERROR_CONFIG',
  /**
   * Browser not supported (WASM).
   * */
  ERROR_BROWSER_SUPPORT = 'ERROR_BROWSER_SUPPORT',
  /**
   * Network error. Unstable connection or provided invalid Verify server URL.
   */
  ERROR_NETWORK = 'ERROR_NETWORK',
  /**
   * Unidentified error.
   */
  ERROR = 'ERROR',

  /**
   * Verification done and successful.
   */
  VERIFIED = 'VERIFIED',
  /**
   * Verification done and unsuccessful.
   */
  NOT_VERIFIED = 'NOT_VERIFIED',
  /**
   * Verification done but additional dashboard review needed.
   */
  NEEDS_REVIEW = 'NEEDS_REVIEW'
}

/**
 * Identity Verification web component's configuration.
 */
export interface IdvInBrowserConfig {
  /**
   * BlinkID license for a domain that this UI Component will be integrated into.
   */
  license: string;
  /**
   * Identity Verification Server URL to work with.
   */
  identityVerificationServerUrl: string;
  /**
   * Frontend application server path on which to find the Identity Verification in-browser
   * SDK resources at. Default is "assets/resources/".
   */
  resourcesDirectoryPath?: string;
  /**
   * Temporary attribute to dictate in which mode to run UI component: "Dev" or "Prod".
   * Default is FALSE.
   */
  devMode?: boolean;
  /**
   * Document scan mechanism which speeds up a process by not scanning a back side
   * of a documents for which it is known that back sides are not needed or empty.
   * Default is TRUE.
   */
  docscanSkipUnsupportedBack?: boolean;
}
