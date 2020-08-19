import { TestBed, inject } from '@angular/core/testing';
import { VoxelRouterCommunicatorService } from './voxel-router.communicator.service';
import { VoxelRouterService, AuthTokenService } from '@voxel/router';
import { HttpHandler, HttpClient } from '@angular/common/http';
import { CommunicatorService } from '../communicator.service';
import { TokenService } from '../../token/token.service';
import { of, Subject } from 'rxjs';

const mockResponse: any = {
  body: {
    status: 200,
  },
  flow: [{
    op: 'a',
    target: 'a',
  }],
};

jest.mock('@voxel/router');
const routerSubject = new Subject();
const router: any = {
  preLogin: jest.fn().mockReturnValue(of(mockResponse)),
  request: jest.fn(),
};

describe('Router implementations tests', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VoxelRouterCommunicatorService,
        AuthTokenService,
        TokenService,
        CommunicatorService,
        { provide: VoxelRouterService, useValue: router },
        HttpHandler,
        HttpClient,
      ],
    });

    (router.preLogin as jest.Mock).mockImplementation(() => {
      return routerSubject;
    });

    (router.request as jest.Mock).mockImplementation(() => {
      return routerSubject;
    });
  });

  afterEach(() => {
    localStorage.removeItem('authToken');
  });

  it('Is logged', inject([VoxelRouterCommunicatorService], (service: VoxelRouterCommunicatorService) => {
    localStorage.setItem('authToken', 'teste');
    const result = service.isLogged();
    expect(result).toBeTruthy();
  }));

  it('Logout', inject([VoxelRouterCommunicatorService], (service: VoxelRouterCommunicatorService) => {
    service.logout();
    const result = service.isLogged();
    expect(result).toBeFalsy();
  }));

  it('Login', inject([VoxelRouterCommunicatorService], (service: VoxelRouterCommunicatorService) => {
    spyOn(service, 'mapOpTarget');
    service.login('teste', 'teste').subscribe(res => {
      expect(res).toBe(mockResponse);
    },
    body => {
      service.mapOpTarget(body.flow);
    });
    expect(router.preLogin).toHaveBeenCalled();
  }));

  it('mapOpTarget', inject([VoxelRouterCommunicatorService], (service: VoxelRouterCommunicatorService) => {
    const flows: any = [{ op: 'op', target: 'target' }];
    service.mapOpTarget(flows);
    expect(window.localStorage.getItem('ops')).not.toBeUndefined();
  }));
});
