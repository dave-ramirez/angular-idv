import { TestBed, inject } from '@angular/core/testing';
import { ICommunicatorService } from './communicator';
import { CommunicatorService } from './communicator.service';
import { VoxelNativeCommunicatorService } from './voxel/voxel-native.communicator.service';
import { VoxelRouterCommunicatorService } from './voxel/voxel-router.communicator.service';

describe('Router implementations tests', () => {

  const routerCommSpy: ICommunicatorService = {
    name: 'Router',
    login: jest.fn(),
    logout: jest.fn(),
    isLogged: jest.fn().mockReturnValue(false),
    doRequest: jest.fn(),
  };

  const voxelCommSpy: ICommunicatorService = {
    name: 'Native',
    login: jest.fn(),
    logout: jest.fn(),
    isLogged: jest.fn().mockReturnValue(false),
    doRequest: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CommunicatorService,
        { provide: VoxelRouterCommunicatorService, useValue: routerCommSpy },
        { provide: VoxelNativeCommunicatorService, useValue: voxelCommSpy }
      ],
    });
  });

  afterEach(() => {
    localStorage.removeItem('authToken');
  });

  it('Is logged', inject([CommunicatorService], (service: CommunicatorService) => {
    // NATIVE IMPLEMENTS LOGIN WITH MEMORY ITEM
    const result = service.isLogged();
    expect(result).toBeFalsy();
  }));

  it('Logout', inject([CommunicatorService], (service: CommunicatorService) => {
    service.logout();
    const result = service.isLogged();
    expect(result).toBeFalsy();
  }));

  it('Login', inject([CommunicatorService], (service: CommunicatorService) => {
    service.login('teste', 'teste');
    expect(service).toBeTruthy();
  }));

  it('doRequest', inject([CommunicatorService], (service: CommunicatorService) => {
    service.doRequest('teste', {});
    expect(service).toBeTruthy();
  }));

  it('use strategy Native', () => {
    (window as any).native = {};
    const service = new CommunicatorService(
      routerCommSpy as VoxelRouterCommunicatorService,
      voxelCommSpy as VoxelNativeCommunicatorService
    );

    expect(service.strategy.name).toBe('Native');
  });

  it('use strategy Router', () => {
    (window as any).native = undefined;
    const service = new CommunicatorService(
      routerCommSpy as VoxelRouterCommunicatorService,
      voxelCommSpy as VoxelNativeCommunicatorService
    );

    expect(service.strategy.name).toBe('Router');
  });

});
