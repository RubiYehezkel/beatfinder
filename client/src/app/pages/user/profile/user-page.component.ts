// Example component class
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@services/auth/auth.service';
import { IUser } from '@models/user.model';
import { RouterModule } from '@angular/router';
import { UserService } from '@services/users/user.service';
import { CommonModule } from '@angular/common';

@Component({
  imports: [RouterModule, CommonModule],
  standalone: true,
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css'],
})
export class UserPageComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}
  public currentUser: IUser | null;
  public userSavedData: any = {};
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.userService.getSavedEvents().subscribe((events) => {
      this.userSavedData = events;
    });
  }

  trackByArtistId(index: number, artist: any): string {
    return artist.spotifyId;
  }

  trackByEventId(index: number, event: any): string {
    return event.id;
  }

  trackByGenre(index: number, genre: string): string {
    return genre;
  }
}
