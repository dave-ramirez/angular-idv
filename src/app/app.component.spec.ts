import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AppComponent } from './app.component';
import { LinksService } from './services/links.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(() => {
    const routerStub = {
      events: { pipe: () => ({ subscribe: () => ({}) }) },
      navigate: ({}),
    };
    const linksServiceStub = { getLinks: () => ({}) };
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [AppComponent],
      providers: [
        { provide: Router, useValue: routerStub },
        { provide: LinksService, useValue: linksServiceStub },
      ],
    });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('can load instance', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to configurations route', () => {
    const routerStub: Router = fixture.debugElement.injector.get(Router);
    spyOn(routerStub, 'navigate').and.callFake(() => ({}));
    component.filter();
    expect(routerStub.navigate).toHaveBeenCalled();
  });
});
