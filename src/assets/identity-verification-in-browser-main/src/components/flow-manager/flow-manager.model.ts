import { VerificationResultDTO } from '../../dto/verify-server.dto';

export type FlowState = 'INITIAL' | 'IN_PROGRESS' | 'FINISHED'
  | 'ERROR_SESSION' | 'ERROR_NETWORK_SESSION'
  | 'ERROR_VERIFICATION' | 'ERROR_NETWORK_VERIFICATION'
  | 'ERROR_NETWORK_OTHER'
  | 'ERROR_CONFIG'
  | 'ERROR'

export type VerificationResult = VerificationResultDTO;

export interface FlowManagerComponentCallbacks {
  onLoaded?: () => void;
  onClose: (
    flowState: FlowState,
    verificationResult?: VerificationResult,
  ) => void;
  onSessionInitialized: (sessionId: string) => void;
}
