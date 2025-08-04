import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ElementRef } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';
import { EventService } from '@services/event/event.service';
import { UserService } from '@services/users/user.service';
import { extractDominantColor } from 'app/utils/colors';
import { Confirm, Notify, Report } from 'notiflix';
import { toZonedTime } from 'date-fns-tz';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [DatePipe, CommonModule, RouterModule],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css',
})
export class EventComponent implements OnInit {
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public eventService: EventService,
    private sanitizer: DomSanitizer,
    private elementRef: ElementRef,
    private userService: UserService,
    public authService: AuthService
  ) {}
  public _eventId: string;
  public _eventPage: any;
  public _userAttending: boolean | undefined;
  public googleCalendarUrl: SafeUrl | undefined;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this._eventId = params['eventId'];
      this.eventService.getEvent(this._eventId).subscribe((artistPage) => {
        this._eventPage = artistPage;
        if (this._eventPage.timezone) {
          this._eventPage.dateTime = toZonedTime(
            this._eventPage.dateTime,
            this._eventPage.timezone
          );
        }
        extractDominantColor(this._eventPage.coverImage).then((data) => {
          const iframe = this.elementRef.nativeElement.querySelector('iframe');
          iframe.src =
            'https://www.stay22.com/embed/gm?invmode=accommodation?aid=affiliateid&address=' +
            this._eventPage.venue +
            ',' +
            this._eventPage.venueAddress +
            ',' +
            this._eventPage.city +
            ',' +
            this._eventPage.country +
            '&checkin=' +
            this._eventPage.dateTime +
            '&checkout=' +
            this._eventPage.dateTime +
            '&hidefooter=true&showsearchbar=false&openmenu=null&disableautohover=true&hidemappanels=false&maincolor=%23FFFFFF&markerimage=' +
            this._eventPage.coverImage;
        });
        this.setGoogleCalendarUrl();
        this._userAttending = this.authService
          .getCurrentUser()
          ?.savedEvents?.includes(this._eventId);
      });
    });
  }

  attendEvent() {
    this.userService
      .attendEvent({ eventId: this._eventId })
      .subscribe((data) => {
        this._userAttending = !this._userAttending;
        this.authService.getCurrentUserFromApi();
        this._userAttending
          ? Notify.success('You are now atteding this event.')
          : Notify.success('You are no longer atteding this event');
        console.log(data);
      });
  }

  setGoogleCalendarUrl() {
    const eventName = encodeURIComponent(this._eventPage.eventName);
    const eventDetails = encodeURIComponent(
      `${this._eventPage.eventName} - More info on BeatFinder`
    );
    const location = encodeURIComponent(
      `${this._eventPage.venue}, ${this._eventPage.venueAddress}, ${this._eventPage.city}, ${this._eventPage.country}`
    );
    const startDate = this.formatDateToGoogleCalendar(
      new Date(this._eventPage.dateTime)
    );

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventName}&details=${eventDetails}&location=${location}&dates=${startDate}/${startDate}`;
    this.googleCalendarUrl = this.sanitizer.bypassSecurityTrustUrl(url);
    console.log(this.googleCalendarUrl);
  }

  formatDateToGoogleCalendar(date: Date): string {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  }

  getLink() {
    return window.location;
  }
}
