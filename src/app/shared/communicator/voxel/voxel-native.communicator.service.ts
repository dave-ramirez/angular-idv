import { Injectable } from '@angular/core';
import { ICommunicatorService } from '../communicator';
import { Observable } from 'rxjs';
import { VoxelNativeCommunicationService, INativeRequest } from '@voxel/native-communication';
import { HttpHeaders } from '@angular/common/http';
import { VoxelRouterService } from '@voxel/router';
import { TokenService } from '../../token/token.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class VoxelNativeCommunicatorService implements ICommunicatorService {

  name = 'Native';

  constructor(
    private voxelNative: VoxelNativeCommunicationService,
    private routerVoxel: VoxelRouterService,
    private tokenService: TokenService
    ) {}

  doRequestNative(params: INativeRequest, _?: HttpHeaders): Observable<any> {
    return this.voxelNative.routerRequest(params);
  }

  getOp(target: string): string {
    const opMap = JSON.parse(this.tokenService.getToken('ops') as string);
    return opMap ? opMap[target] : '';
  }

  doRequestRouter(operation: string, body?: any) {
    return this.routerVoxel.request(this.getOp(operation), body)
    .pipe(
      map((res: any) => res.data),
    );
  }

}

