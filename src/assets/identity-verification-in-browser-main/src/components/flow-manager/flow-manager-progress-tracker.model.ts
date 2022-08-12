import { FlowManagerStepStatus } from '../../flowManager';

export interface FmptCheckpoint {
  name: string;
  text: string;
  subText: string;
  status: FlowManagerStepStatus;
}