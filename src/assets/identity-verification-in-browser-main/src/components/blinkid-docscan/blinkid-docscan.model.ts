import {
  BlinkIdCombinedRecognizerResult
} from '@microblink/blinkid-in-browser-sdk';
export interface BlinkIdDocScanConfig {
  blinkidLicence: string;
  resourcesDirPath: string;
  skipUnsupportedBack?: boolean;
  callbacks: {
    onLoadDone: () => void;
    onStart: () => void;
    onStartDone: () => void;
    onFinish: (data?: BlinkIdDocscanFinishData) => void;
    onNetworkProblems: () => void;
  }
}

export interface BlinkIdDocscanFinishData {
  success?: BlinkIdDocScanSuccessData,
  error?: BlinkIdDocScanError
}

export interface BlinkIdDocScanSuccessData {
  originalData: BlinkIdCombinedRecognizerResult;
  originalDataJSON: string;
  originalDataJSONSignature: string;
  originalDataJSONSignatureVersion: string;
  editedData: Record<string, string>;
}

export type BlinkIdDocScanError = 'ERROR_LICENSE' | 'ERROR_NETWORK' | 'ERROR';

export enum BlinkIdRecognizerName {
  BlinkIdCombinedRecognizer = 'BlinkIdCombinedRecognizer'
}
