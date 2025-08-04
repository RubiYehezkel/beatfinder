import { Component, NgModule, OnInit } from '@angular/core';
import { EventService } from '@services/event/event.service';
import { numToShortMonth } from 'app/utils/date';
import { Confirm, Notify, Report } from 'notiflix';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArtistPageService } from '@services/artist/artist.service';

@Component({
  selector: 'app-manage-artists',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manage-artists.component.html',
  styleUrl: './manage-artists.component.css',
})
export class ManageArtistsComponent {
  constructor(private artistService: ArtistPageService) {}
  public allArtist: any = {};
  ngOnInit() {
    this.loadEvents();
  }
  loadEvents() {
    this.allArtist = {};
    this.artistService.getArtists().subscribe((artist) => {
      this.allArtist = artist;
    });
  }
  getMonthName(monthName: string) {
    return numToShortMonth(parseInt(monthName));
  }
  deleteEvent(eventId: string) {
    Confirm.init({
      borderRadius: '5px',
      okButtonBackground: '#ff5861',
      titleColor: '#ff5861',
    });
    Confirm.show(
      'Confirm!',
      'Are you sure that you want to delete?',
      'Yes',
      'No',
      () => {
        this.artistService.deleteArtist(eventId).subscribe({
          next: () => {},
          error: () => {
            Notify.init({
              position: 'right-bottom',
            });
            Notify.failure('Something went wrong.');
          },
          complete: () => {
            Notify.init({
              position: 'right-bottom',
            });
            Notify.success('Event deleted successfully.');
            this.loadEvents();
          },
        });
      },
      () => {},
      {}
    );
  }

  createEvent() {
    // Logic to navigate to create event page or open a modal to create event
    console.log('Creating event');
  }
}
