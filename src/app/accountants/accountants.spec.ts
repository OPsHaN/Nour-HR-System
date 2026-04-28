import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Accountants } from './accountants';

describe('Accountants', () => {
  let component: Accountants;
  let fixture: ComponentFixture<Accountants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Accountants]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Accountants);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
