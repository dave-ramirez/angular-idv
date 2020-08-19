import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {

  hasToken(token: any) {
    return !!this.getToken(token);
  }

  setToken(key: string, token: any) {
    window.localStorage.setItem(key, token);
  }

  getToken(token: any) {
    return window.localStorage.getItem(token);
  }

  removeToken(token: any) {
    window.localStorage.removeItem(token);
  }

  removeAll() {
    window.localStorage.clear();
  }

}
