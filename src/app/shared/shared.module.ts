import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  VoxelButtonModule,
  VoxelCardModule,
  VoxelGoToModule,
  VoxelHeaderModule,
  VoxelInputModule,
  VoxelLoadingModule,
  VoxelRadioButtonModule,
} from '@voxel/mobile';
import { NativeCommunicationModule } from '@quickweb/native-communication';

const baseModules = [
  CommonModule,
  RouterModule,
  FormsModule,
];

const voxelModules = [
  VoxelHeaderModule,
  VoxelInputModule,
  VoxelButtonModule,
  VoxelLoadingModule,
  VoxelGoToModule,
  VoxelCardModule,
  VoxelRadioButtonModule,
  NativeCommunicationModule
];

@NgModule({
  imports: [
    ...baseModules,
    ...voxelModules,
  ],
  exports: [
    ...baseModules,
    ...voxelModules,
  ],
})
export class SharedModule { }
