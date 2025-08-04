import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationChooserComponent } from './location-chooser.component';

describe('LocationChooserComponent', () => {
  let component: LocationChooserComponent;
  let fixture: ComponentFixture<LocationChooserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationChooserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LocationChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
