import { FaceTecSessionResult } from './sdk-interface/FaceTecPublicApi';

export interface Config {
  initializeInProduction: boolean;
  getInitParams(): Promise<FaceTecConnectorInitParams>;
  verifyEnrollment3D: (
    facetecSessionResult: FaceTecSessionResult,
    facetecUserAgent: string,
  ) => Promise<FaceTecSessionResultVerificationResult>;
}

export class FaceTecConnectorInitParams {
  public resourcesDirectory: string;
  public imagesDirectory: string;

  constructor(
    public sessionToken: string,
    public deviceKeyIdentifier: string,
    public faceScanEncriptionKey: string,
    public productionKeyText: string,
    optional?: {
      resourcesDirectory?: string;
      imagesDirectory?: string;
    }
  ) {
    if (optional) {
      const { resourcesDirectory, imagesDirectory } = optional;
      if (resourcesDirectory) {
        this.resourcesDirectory = resourcesDirectory;
      }
      if (imagesDirectory) {
        this.imagesDirectory = imagesDirectory;
      }
    }
  }
}

export class FaceTecSessionResultVerificationResult {
  constructor(
    public state: 'PROCESSED' | 'NOT_PROCESSED' | 'NETWORK_ERROR',
    public verificationSuccessful: boolean,
    public scanResultBlob: string
  ) { }
}

export enum InitializationFailureReason {
  CONFIG_KEYS_NETWORK_FETCH_ERROR = 'CONFIG_KEYS_NETWORK_FETCH_ERROR',
  CONFIG_KEYS_ERROR = 'CONFIG_KEYS_ERROR',
  CANCELED = 'CANCELED'
}

export enum Result {
  /** Users liveness has been successfully verified */
  VERIFIED = 'VERIFIED',
  /** Liveness couldn't be verified */
  NOT_VERIFIED = 'NOT_VERIFIED',
  /** A network error occurred during verification */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** User was inactive for more than 60 seconds */
  SESSION_TIMEOUT = 'SESSION_TIMEOUT',
  /** User exited the verification UI */
  CANCELED_BY_USER = 'CANCELED_BY_USER',
  /** User backgrounded the app */
  CONTEXT_SWITCH = 'CONTEXT_SWITCH',
  /** No camera permission or a camera initialization issue */
  CAMERA_ERROR = 'CAMERA_ERROR',
  /** Check your configuration keys/values */
  CONFIG_KEYS_ERROR = 'CONFIG_KEYS_ERROR',
  /** Only portrait mode is allowed for FaceTec UI */
  ONLY_PORTRAIT_MODE_ALLOWED = 'ONLY_PORTRAIT_MODE_ALLOWED',
  /** An unknown error occured */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  /** Too many failed attempts (12 failed attempts in 5 minutes), user is locked out */
  LOCKED_OUT = 'LOCKED_OUT',
  /** Key used for too many sessions, renew your key */
  GRACE_PERIOD_EXCEEDED = 'GRACE_PERIOD_EXCEEDED'
}

export interface Callbacks {
  onInitializationDone: (status: boolean) => void;
  onSessionLaunchDone: (status: boolean) => void;
  onResult: (result: Result, auditTrailImagesBase64?: string[]) => void;
}