import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ArtistPageService } from '@services/artist/artist.service';
import { numToShortMonth } from 'app/utils/date';
import { extractDominantColor } from 'app/utils/colors';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { UserService } from '@services/users/user.service';
import { AuthService } from '@services/auth/auth.service';
import { Confirm, Notify, Report } from 'notiflix';

@Component({
  selector: 'app-artist-page',
  standalone: true,
  imports: [RouterModule, DatePipe, CommonModule],
  templateUrl: './artist-page.component.html',
  styleUrl: './artist-page.component.css',
})
export class ArtistPageComponent implements OnInit {
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public artistPageService: ArtistPageService,
    private sanitizer: DomSanitizer,
    private elementRef: ElementRef,
    private userService: UserService,
    public authService: AuthService
  ) {}
  private _artistId: string;
  public _artistPage: any = undefined;
  public _userFollowing: boolean | undefined = false;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this._artistId = params['artistId'];
      this.artistPageService
        .getArtist(this._artistId)
        .subscribe((artistPage) => {
          this._artistPage = artistPage;
          extractDominantColor(this._artistPage.artist.profileImage).then(
            (data) => {
              this._artistPage.dominantColor = data;
              const iframe =
                this.elementRef.nativeElement.querySelector('iframe');
              iframe.src =
                'https://open.spotify.com/embed/artist/' +
                this._artistPage.artist.spotifyID +
                '?utm_source=generator';
              this.resetScrollPosition();
            }
          );
          this._userFollowing = this.authService
            .getCurrentUser()
            ?.favArtists?.includes(this._artistId);
          console.log(
            this.authService
              .getCurrentUser()
              ?.favArtists?.includes(this._artistId)
          );
        });
    });
  }

  followArtist() {
    this.userService
      .followArtist({ artistId: this._artistId })
      .subscribe((data) => {
        this._userFollowing = !this._userFollowing;
        this.authService.getCurrentUserFromApi();
        this._userFollowing
          ? Notify.success(
              'You are now following ' + this._artistPage.artist.name
            )
          : Notify.success(
              'You are no longer following ' + this._artistPage.artist.name
            );
      });
  }
  resetScrollPosition() {
    const similarArtistsDiv =
      this.elementRef.nativeElement.querySelector('#similar-artists');
    if (similarArtistsDiv) {
      similarArtistsDiv.scrollLeft = 0;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' }); // This will scroll the page to the top
  }

  getLink() {
    return window.location;
  }
}
