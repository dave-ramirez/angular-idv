import { TestBed } from '@angular/core/testing';
import { VoxelRouterService, AuthTokenService } from '@voxel/router';
import { HttpHandler, HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { VoxelNativeCommunicationService } from '@voxel/native-communication';

jest.mock('@voxel/native-communication');
const nativeSubject = new Subject();
const native: any = {
  routerRequest: jest.fn(),
  requestNativeFeature: jest.fn(),
};
describe('Router implementations tests', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VoxelNativeCommunicationService,
        AuthTokenService,
        VoxelRouterService,
        HttpHandler,
        HttpClient,
      ],
    });

    (native.routerRequest as jest.Mock).mockImplementation(() => {
      return nativeSubject;
    });

    (native.requestNativeFeature as jest.Mock).mockImplementation(() => {
      return nativeSubject;
    });
  });

  afterEach(() => {
    localStorage.removeItem('authToken');
  });

});
