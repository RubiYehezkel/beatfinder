import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageArtistsComponent } from './manage-artists.component';

describe('ManageArtistsComponent', () => {
  let component: ManageArtistsComponent;
  let fixture: ComponentFixture<ManageArtistsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageArtistsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageArtistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
