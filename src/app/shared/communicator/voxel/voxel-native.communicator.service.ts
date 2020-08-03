import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VoxelNativeCommunicationService, INativeRequest } from '@voxel/native-communication';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class VoxelNativeCommunicatorService {

  name = 'Native';

  constructor(private voxelNative: VoxelNativeCommunicationService) {}

  metodo(params: INativeRequest, _?: HttpHeaders): Observable<any> {
    console.log('qwe')
    return this.voxelNative.routerRequest(params);
  }

}
