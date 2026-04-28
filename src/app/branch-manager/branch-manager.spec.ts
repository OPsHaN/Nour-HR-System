import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchManager } from './branch-manager';

describe('BranchManager', () => {
  let component: BranchManager;
  let fixture: ComponentFixture<BranchManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
