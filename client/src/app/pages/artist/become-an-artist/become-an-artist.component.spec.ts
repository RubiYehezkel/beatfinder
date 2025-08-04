import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BecomeAnArtistComponent } from './become-an-artist.component';

describe('BecomeAnArtistComponent', () => {
  let component: BecomeAnArtistComponent;
  let fixture: ComponentFixture<BecomeAnArtistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BecomeAnArtistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BecomeAnArtistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
