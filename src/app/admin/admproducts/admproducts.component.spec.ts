import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmproductsComponent } from './admproducts.component';

describe('AdmproductsComponent', () => {
  let component: AdmproductsComponent;
  let fixture: ComponentFixture<AdmproductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmproductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmproductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
