import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationChooserMiniComponent } from './location-chooser-mini.component';

describe('LocationChooserComponent', () => {
  let component: LocationChooserMiniComponent;
  let fixture: ComponentFixture<LocationChooserMiniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationChooserMiniComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationChooserMiniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
