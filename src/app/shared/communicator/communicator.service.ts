import { Injectable } from '@angular/core';
import { ICommunicatorService } from './communicator';
import { Observable } from 'rxjs';
import { VoxelRouterCommunicatorService } from './voxel/voxel-router.communicator.service';
import { VoxelNativeCommunicatorService } from './voxel/voxel-native.communicator.service';

@Injectable()
export class CommunicatorService implements ICommunicatorService {

  name: string;

  strategy: ICommunicatorService;

  constructor(
    private voxelRouter: VoxelRouterCommunicatorService,
    private voxelNative: VoxelNativeCommunicatorService
  ) {
    console.log('asd')
    this.strategy = (window as any).native ? voxelNative : this.voxelRouter;
    console.log('Using strategy: ', this.strategy.name);
  }

  routerSelect() {
    this.strategy = this.voxelRouter;
    console.log('Using strategy: ', this.strategy.name);
  }

  nativeSelect() {
    this.strategy = this.voxelNative;
    console.log('Using strategy: ', this.strategy.name);
  }

  doRequestRouter(operation: string, body: any = {}): Observable<any> {
    return this.strategy.doRequestRouter(operation, body);
  }

  doRequestNative(operation: any, HTTP?: any) {
    return this.strategy.doRequestRouter(operation, HTTP);
  }

}
