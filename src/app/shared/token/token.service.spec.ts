import { TestBed, inject } from '@angular/core/testing';

import { TokenService } from './token.service';

describe('Token service validations', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TokenService],
    });
  });

  afterEach(() => {
    localStorage.removeItem('authToken');
  });

  it('User is authentic', inject([TokenService], (service: TokenService) => {
    localStorage.setItem('authToken', 'TESTE');
    expect(service.hasToken('authToken')).toBeTruthy();
  }));

  it('User is not authentic', inject([TokenService], (service: TokenService) => {
    expect(service.hasToken('authToken')).toBeFalsy();
  }));

  it('Setting token', inject([TokenService], (service: TokenService) => {
    service.setToken('authToken', 'teste');
    expect(service.hasToken('authToken')).toBeTruthy();
  }));

  it('Remove token', inject([TokenService], (service: TokenService) => {
    service.setToken('authToken', 'teste');
    service.removeToken('authToken');
    expect(service.hasToken('authToken')).toBeFalsy();
  }));

});
