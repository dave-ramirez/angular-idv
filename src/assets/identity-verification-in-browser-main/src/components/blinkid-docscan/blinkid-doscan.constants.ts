import { BlinkIdCombinedRecognizerSettings } from '@microblink/blinkid-in-browser-sdk';

export const combinedRecognizerDefaultSettings: Partial<BlinkIdCombinedRecognizerSettings> = {
  returnFullDocumentImage: true,
  returnEncodedFullDocumentImage: true,
  returnFaceImage: true,
  returnEncodedFaceImage: true,
  returnSignatureImage: true,
  returnEncodedSignatureImage: true,
};
