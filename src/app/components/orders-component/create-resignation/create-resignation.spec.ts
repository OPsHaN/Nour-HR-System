import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateResignation } from './create-resignation';

describe('CreateResignation', () => {
  let component: CreateResignation;
  let fixture: ComponentFixture<CreateResignation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateResignation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateResignation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
