import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBeatfinderArtistComponent } from './manage-beatfinder-artist.component';

describe('ManageBeatfinderArtistComponent', () => {
  let component: ManageBeatfinderArtistComponent;
  let fixture: ComponentFixture<ManageBeatfinderArtistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBeatfinderArtistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageBeatfinderArtistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
