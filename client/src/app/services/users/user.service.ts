import { Injectable } from '@angular/core';
import { ApiService } from '@services/api.service';
import { IUser } from '@models/user.model';
import { Observable } from 'rxjs';
import { IArtist } from '@models/artist.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private api: ApiService) {}

  private userApiRoute = 'users';

  // Use the ApiService to get a user by ID, returns an Observable of IUser
  getUser(id: string): Observable<IUser> {
    return this.api.get(`${this.userApiRoute}/${id}`, true);
  }

  // Use the ApiService to get a user by ID, returns an Observable of IUser
  getUsers(): Observable<[IUser]> {
    return this.api.get(`${this.userApiRoute}`, true);
  }

  // Use the ApiService to create a new user, returns an Observable of IUser
  createUser(user: IUser): Observable<IUser> {
    return this.api.post(`${this.userApiRoute}`, user, true);
  }

  // Update a user, returns an Observable of IUser
  updateUser(id: string, user: Partial<IUser>): Observable<IUser> {
    return this.api.patch(`${this.userApiRoute}/${id}`, user, true);
  }

  // Delete a user by ID, returns an Observable of IUser
  deleteUser(id: string): Observable<IUser> {
    return this.api.delete(`${this.userApiRoute}/${id}`, true);
  }

  followArtist(id: any): Observable<IArtist> {
    return this.api.post(`${this.userApiRoute}/follow-artist`, id, true);
  }

  attendEvent(id: any): Observable<IArtist> {
    return this.api.post(`${this.userApiRoute}/save-event`, id, true);
  }

  getSavedEvents(): Observable<any> {
    return this.api.get(`${this.userApiRoute}/get-saved-data`, true);
  }
}
