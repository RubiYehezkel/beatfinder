import { Component, NgModule, OnInit } from '@angular/core';
import { EventService } from '@services/event/event.service';
import { numToShortMonth } from 'app/utils/date';
import { Confirm, Notify, Report } from 'notiflix';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-manage-events',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manage-events.component.html',
  styleUrl: './manage-events.component.css',
})
export class ManageEventsComponent implements OnInit {
  constructor(private eventService: EventService) {}
  public myEvents: any = {};
  ngOnInit() {
    this.loadEvents();
  }
  loadEvents() {
    this.myEvents = {};
    this.eventService.getEvents().subscribe((events) => {
      this.myEvents = events;
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
        this.eventService.deleteEvent(eventId).subscribe({
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
  eventsNumber() {
    return Object.keys(this.myEvents).length;
  }

  createEvent() {
    // Logic to navigate to create event page or open a modal to create event
    console.log('Creating event');
  }
}
