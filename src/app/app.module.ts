import '@angular/common/locales/pt';

import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { VoxelLoggerModule } from '@voxel/logger';
import { registerLocaleData } from '@angular/common';
import { SegmentTypes, VoxelConfigModule, VoxelLinkModule } from '@voxel/mobile';
import { NativeAnalyticsObject, NativeObject, VoxelNativeCommunicationModule } from '@voxel/native-communication';
import { CommunicatorModule } from './shared/communicator/communicator.module';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexComponent } from './index/index.component';
import { SharedModule } from './shared/shared.module';

import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt, 'pt');

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    VoxelConfigModule.forRoot({
      production: environment.production,
      segment: SegmentTypes.Varejo,
    }),
    VoxelLoggerModule.forRoot({
      production: environment.production,
      applicationName: 'your-app-name',
    }),
    VoxelLinkModule,
    VoxelNativeCommunicationModule,
    SharedModule,
    CommunicatorModule
  ],
  providers: [
    {
      provide: NativeObject,
      useValue: environment.sdkObjectMock,
    },
    {
      provide: NativeAnalyticsObject,
      useValue: environment.analyticsObjectMock,
    },
    {
      provide: LOCALE_ID,
      useValue: 'pt',
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
