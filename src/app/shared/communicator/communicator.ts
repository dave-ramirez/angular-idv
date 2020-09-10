import { INativeRequest } from '@quickweb/native-communication';

export interface ICommunicatorService {
  
  doRequestNative(operation: INativeRequest, HTTP?: any): any;

}
