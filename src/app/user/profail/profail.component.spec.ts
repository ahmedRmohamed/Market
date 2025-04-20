import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfailComponent } from './profail.component';

describe('ProfailComponent', () => {
  let component: ProfailComponent;
  let fixture: ComponentFixture<ProfailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
