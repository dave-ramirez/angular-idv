import {
  BlinkIdDocScanError,
  BlinkIdDocScanSuccessData
} from '../blinkid-docscan/blinkid-docscan.model';

export interface BlinkIdDocScanCameraConfig {
  blinkidLicence: string;
  resourcesDirPath: string;
  skipUnsupportedBack?: boolean;
  callbacks: {
    onLoadDone?: () => void;
    onClose?: () => void;
    onError: (error: BlinkIdDocScanError) => void;
    onSuccess: (data: BlinkIdDocScanCameraSuccessData) => void;
  };
  resourcesAlreadyLoaded?: boolean;
}

export type BlinkIdDocScanCameraSuccessData = Omit<BlinkIdDocScanSuccessData, 'editedData'>;
