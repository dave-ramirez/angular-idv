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
  VoxelWarningModule,
} from '@voxel/mobile';

const baseModules = [
  CommonModule,
  RouterModule,
  FormsModule,
];

const voxelModules = [
  VoxelWarningModule,
  VoxelHeaderModule,
  VoxelInputModule,
  VoxelButtonModule,
  VoxelLoadingModule,
  VoxelGoToModule,
  VoxelCardModule,
  VoxelRadioButtonModule,
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
