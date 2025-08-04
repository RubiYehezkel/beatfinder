import { TestBed } from '@angular/core/testing';

import { ArtistPageService } from './artist.service';

describe('EventService', () => {
  let service: ArtistPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArtistPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
