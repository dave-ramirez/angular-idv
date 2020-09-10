import { TestBed, inject } from '@angular/core/testing';
import { ICommunicatorService } from './communicator';
import { CommunicatorService } from './communicator.service';
import { NativeCommunicatorService } from './native/native.communicator.service';

describe('Router implementations tests', () => {

  const voxelCommSpy: ICommunicatorService = {
    doRequestNative: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CommunicatorService,
        { provide: NativeCommunicatorService, useValue: voxelCommSpy }
      ],
    });
  });

  afterEach(() => {
    localStorage.removeItem('authToken');
  });

  it('doRequestNative', inject([CommunicatorService], (service: CommunicatorService) => {
    service.doRequestNative('teste', {});
    expect(service).toBeTruthy();
  }));

  it('use strategy Native', () => {
    (window as any).native = {};
    const service = new CommunicatorService(
      voxelCommSpy as NativeCommunicatorService
    );
    console.log(service)
  });

  it('use strategy Router', () => {
    (window as any).native = undefined;
    const service = new CommunicatorService(
      voxelCommSpy as NativeCommunicatorService
    );
    console.log(service)
  });

});
