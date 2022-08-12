import {
  BlinkIdDocScanError,
  BlinkIdDocScanSuccessData
} from '../blinkid-docscan/blinkid-docscan.model';

export interface BlinkIdDocScanImageConfig {
  blinkidLicence: string;
  resourcesDirPath: string;
  skipUnsupportedBack?: boolean;
  callbacks: {
    onLoadDone?: () => void;
    onClose?: () => void;
    onError: (error: BlinkIdDocScanError) => void;
    onSuccess: (data: BlinkIdDocScanImageSuccessData) => void;
  };
  resourcesAlreadyLoaded?: boolean;
}

export type BlinkIdDocScanImageSuccessData = Omit<BlinkIdDocScanSuccessData, 'editedData'>;