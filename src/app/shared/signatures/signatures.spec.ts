import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { NativeCommunicationService } from '@quickweb/native-communication';
import { Signature } from './signatures';

jest.mock('@quickweb/native-communication');
const nativeSubject = new Subject();
const native: any = {
  routerRequest: jest.fn(),
};

describe('Signature', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: NativeCommunicationService,
          useValue: native as any,
        },
      ],
    });

    (native.routerRequest as jest.Mock).mockImplementation(() => {
      return nativeSubject;
    });
  });

  it('check the op', () => {
    const productsSignature = new Signature();
    expect(productsSignature.op).toEqual('card_details_appt_get');
  });

  it('check the method', () => {
    const productsSignature = new Signature();
    expect(productsSignature.method).toEqual('POST');
  });
});
