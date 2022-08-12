import { BlinkIdCombinedRecognizerSettings } from '@microblink/blinkid-in-browser-sdk';
import { combinedRecognizerDefaultSettings } from './blinkid-doscan.constants';

export function applyDefaultCombinedRecognizerSettings(
  settings: Partial<BlinkIdCombinedRecognizerSettings>
): void {
  Object.assign(settings, combinedRecognizerDefaultSettings);
}
