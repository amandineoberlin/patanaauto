import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartegriseComponent } from './cartegrise.component';

describe('CartegriseComponent', () => {
  let component: CartegriseComponent;
  let fixture: ComponentFixture<CartegriseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartegriseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartegriseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
