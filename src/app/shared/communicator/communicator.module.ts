import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunicatorService } from './communicator.service';
import { VoxelNativeCommunicatorService } from './voxel/voxel-native.communicator.service';
import { VoxelRouterCommunicatorService } from './voxel/voxel-router.communicator.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  exports: [],
  providers: [
    CommunicatorService,
    VoxelNativeCommunicatorService,
    VoxelRouterCommunicatorService
  ],
})
export class CommunicatorModule {}
