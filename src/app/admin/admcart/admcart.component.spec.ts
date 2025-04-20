import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmcartComponent } from './admcart.component';

describe('AdmcartComponent', () => {
  let component: AdmcartComponent;
  let fixture: ComponentFixture<AdmcartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmcartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmcartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
