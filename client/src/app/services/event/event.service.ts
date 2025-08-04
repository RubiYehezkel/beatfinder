import { Injectable } from '@angular/core';
import { ApiService } from '@services/api.service';
import { IEvent } from '@models/event.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(private api: ApiService) {}
  private eventApiRoute = 'event';

  // Get events, returns an Observable of IEvent
  getEvents(): Observable<IEvent> {
    return this.api.get(`${this.eventApiRoute}`, true);
  }

  // Get an event by ID, returns an Observable of IEvent
  getEvent(id: string): Observable<IEvent> {
    return this.api.get(`${this.eventApiRoute}/${id}`, false);
  }

  // Create a new event, returns an Observable of IEvent
  createEvent(event: FormData): Observable<IEvent> {
    return this.api.post(`${this.eventApiRoute}`, event, true);
  }

  // Update an event, returns an Observable of IEvent
  updateEvent(id: string, event: Partial<FormData>): Observable<IEvent> {
    return this.api.patch(`${this.eventApiRoute}/${id}`, event, true);
  }

  // Delete an event by ID, returns an Observable of IEvent
  deleteEvent(id: string): Observable<IEvent> {
    return this.api.delete(`${this.eventApiRoute}/${id}`, true);
  }
}
