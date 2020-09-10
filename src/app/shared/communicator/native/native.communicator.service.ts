import { Injectable } from '@angular/core';
import { ICommunicatorService } from '../communicator';
import { Observable } from 'rxjs';
import { NativeCommunicationService, INativeRequest } from '@quickweb/native-communication';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NativeCommunicatorService implements ICommunicatorService {

  constructor(
    private native: NativeCommunicationService) {}

  doRequestNative(params: INativeRequest, _?: HttpHeaders): Observable<any> {
    return this.native.routerRequest(params);
  }
}

