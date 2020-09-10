import { TestBed } from '@angular/core/testing';
import { HttpHandler, HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { NativeCommunicationService } from '@quickweb/native-communication';

jest.mock('@quickweb/native-communication');
const nativeSubject = new Subject();
const native: any = {
  routerRequest: jest.fn(),
  requestNativeFeature: jest.fn(),
};
describe('Router implementations tests', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NativeCommunicationService,
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
