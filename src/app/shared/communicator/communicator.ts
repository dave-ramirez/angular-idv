import { INativeRequest } from '@voxel/native-communication';

export interface ICommunicatorService {
  name: string;

  doRequestRouter(operation: string, body?: any): any;

  doRequestNative(operation: INativeRequest, HTTP?: any): any;

}
