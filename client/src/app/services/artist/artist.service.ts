import { Injectable } from '@angular/core';
import { ApiService } from '@services/api.service';
import { IArtist } from '@models/artist.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ArtistPageService {
  constructor(private api: ApiService) {}

  private artistApiRoute = 'artist';

  // Get an artist by ID, returns an Observable of IEvent
  getArtist(id: string): Observable<any> {
    return this.api.get(`${this.artistApiRoute}/${id}`, false);
  }

  getArtists(): Observable<[IArtist]> {
    return this.api.get(`${this.artistApiRoute}`, true);
  }

  // Create a new artist page, returns an Observable of IEvent
  createArtist(artist: FormData): Observable<IArtist> {
    return this.api.post(`${this.artistApiRoute}`, artist, true);
  }

  // Update an artist, returns an Observable of IEvent
  updateArtist(id: string, artist: Partial<IArtist>): Observable<IArtist> {
    return this.api.patch(`${this.artistApiRoute}/${id}`, artist, true);
  }

  // Delete an artist by ID, returns an Observable of IEvent
  deleteArtist(id: string): Observable<IArtist> {
    return this.api.delete(`${this.artistApiRoute}/${id}`, true);
  }

  me(): Observable<IArtist> {
    return this.api.get(`${this.artistApiRoute}/me`, true);
  }
}
