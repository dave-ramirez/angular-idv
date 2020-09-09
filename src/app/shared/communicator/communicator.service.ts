import { Injectable } from '@angular/core';
import { ICommunicatorService } from './communicator';
import { NativeCommunicatorService } from './native/voxel-native.communicator.service';

@Injectable()
export class CommunicatorService implements ICommunicatorService {

  constructor(
    private native: NativeCommunicatorService
  ) { }

  doRequestNative(operation: any, HTTP?: any) {
    return this.native.doRequestNative(operation, HTTP);
  }

}
