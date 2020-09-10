import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunicatorService } from './communicator.service';
import { NativeCommunicatorService } from './native/native.communicator.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  exports: [],
  providers: [
    CommunicatorService,
    NativeCommunicatorService,
  ],
})
export class CommunicatorModule {}
