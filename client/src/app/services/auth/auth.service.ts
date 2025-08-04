import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, throwError } from 'rxjs';
import { ApiService } from '@services/api.service';
import { IUser } from '@models/user.model';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { environment } from '@environments/environment';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private apiService: ApiService) {}

  private userApiRoute = 'users';

  counter = 0;
  isFirstTimeUserFetch$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  currentUser$: BehaviorSubject<IUser | null> =
    new BehaviorSubject<IUser | null>(null);
  isLoggedIn$ = this.currentUser$.pipe(map((user) => !!user));

  // Login method
  login(email: string, password: string): Observable<IUser> {
    return this.apiService
      .post(`${this.userApiRoute}/login`, { email, password }, true)
      .pipe(
        tap((user: IUser) => {
          this.currentUser$.next(user);
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  getCurrentUser(): IUser | null {
    return this.currentUser$.value;
  }

  async spotifyLogin() {
    const sdk = await SpotifyApi.performUserAuthorization(
      '22eaa0b904d84646b189e3929ed13bc7',
      environment.spotifyRetirectionURL,
      ['user-follow-read', 'user-top-read', 'user-read-email'],
      '/api/users/spotify/accept-user-token'
    );
    this.apiService
      .post(
        `${this.userApiRoute}/spotify/accept-user-token`,
        sdk.accessToken,
        true
      )
      .subscribe({
        next: (user: IUser) => {
          this.currentUser$.next(user);
        },
        error: (error: any) => {
          console.error('Error logging in:', error);
        },
      });
  }

  // Get the current user's profile
  getCurrentUserFromApi(): void {
    if (this.counter === 0) this.isFirstTimeUserFetch$.next(true);
    this.apiService.get(`${this.userApiRoute}/me`, true).subscribe({
      next: (user: IUser) => {
        this.currentUser$.next(user);
      },
      error: (error: any) => {
        console.error('Error logging in:', error);
      },
      complete: () => {
        if (this.counter > 0) return;
        this.isFirstTimeUserFetch$.next(false);
        this.counter++;
      },
    });
  }

  resetPassword(
    currentPassword: string,
    newPassword: string
  ): Observable<IUser> {
    return this.apiService.post(
      `${this.userApiRoute}/reset-password`,
      { oldPassword: currentPassword, newPassword: newPassword },
      true
    );
  }
  // Logout method
  logout(): Observable<any> {
    return this.apiService.post(`${this.userApiRoute}/logout`, {}, true);
  }
}
