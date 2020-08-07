import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ICommunicatorService } from '../communicator';
import { Observable } from 'rxjs';
import { VoxelRouterService } from '@voxel/router';
import { TokenService } from '../../token/token.service';
import { INativeRequest, VoxelNativeCommunicationService } from '@voxel/native-communication';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class VoxelRouterCommunicatorService implements ICommunicatorService {

  constructor(
    private routerVoxel: VoxelRouterService,
    private tokenService: TokenService,
    private voxelNative: VoxelNativeCommunicationService
  ) {}

  name = 'Router';

  mapOpTarget(flows: [any]): void {
    const opsMap = flows.reduce((acc, op) => {
      acc[op.target] = op.op;
      return acc;
    }, {});
    this.tokenService.setToken('ops', JSON.stringify(opsMap));
  }

  getOp(target: string): string {
    const opMap = JSON.parse(this.tokenService.getToken('ops') as string);
    return opMap ? opMap[target] : '';
  }

  doRequestRouter(operation: string, body: any = {}): Observable<any> {
    return this.routerVoxel.request(this.getOp(operation), body)
    .pipe(
      map((res: any) => res.data),
    );
  }

  doRequestNative(params: INativeRequest, _?: HttpHeaders): Observable<any> {
    return this.voxelNative.routerRequest(params);
  }

}
