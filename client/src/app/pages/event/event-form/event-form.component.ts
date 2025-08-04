import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { EventService } from '@services/event/event.service';
import { IEvent } from '@models/event.model';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '@services/api.service';
import { Confirm, Notify, Report } from 'notiflix';
import { PopularGenresList } from 'app/utils/genres';
import { LocationChooserMiniComponent } from 'app/components/location-chooser-mini/location-chooser-mini.component';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    LocationChooserMiniComponent,
  ],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css'],
})
export class EventFormComponent implements OnInit {
  eventForm: FormGroup;
  public popularGenres = PopularGenresList;
  isEditMode: boolean = false;
  eventId: string | null = null;
  selectedImage: File | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private apiService: ApiService
  ) {
    this.eventForm = this.fb.group({
      eventName: ['', Validators.required],
      coverImage: [''],
      genres: [[], Validators.required],
      dateTime: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern('https?://.+')]],
      description: ['', Validators.required],
      venue: ['', Validators.required],
      venueAddress: ['', Validators.required],
      location: ['', Validators.required],
      visibility: [false],
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.eventId = params.get('id');
      this.isEditMode = !!this.eventId;
      if (this.isEditMode && this.eventId) {
        this.loadEventData(this.eventId);
      }
    });
  }

  loadEventData(id: string) {
    this.eventService.getEvent(id).subscribe((event) => {
      this.eventForm.patchValue(event);
      console.log(event);
      this.eventForm.get('description')?.setValue(event.description);
    });
  }

  onSubmit() {
    if (this.eventForm.valid) {
      const formData = new FormData();
      Object.keys(this.eventForm.value).forEach((key) => {
        formData.append(key, this.eventForm.value[key]);
        if (key === 'location') {
          formData.append('city', this.eventForm.value[key].split(',')[0]);
          formData.append(
            'country',
            this.eventForm.value[key].split(',')[1].trim()
          );
        }
      });
      if (this.selectedImage) {
        formData.append(
          'profileImage',
          this.selectedImage,
          this.selectedImage.name
        );
      }
      formData.set(
        'dateTime',
        new Date(this.eventForm.value['dateTime']).toISOString()
      );
      if (this.isEditMode && this.eventId) {
        this.eventService
          .updateEvent(this.eventId, formData)
          .subscribe((data) => {
            Notify.init({
              position: 'right-bottom',
            });
            Notify.success('Event edited successfully.');
          });
      } else {
        this.eventService.createEvent(formData).subscribe((data) => {
          this.router.navigateByUrl('/e/' + data._id);
        });
      }
    } else {
      Notify.init({
        position: 'right-bottom',
      });
      Notify.failure('Form not valid.');
    }
  }

  selectImage($event: any) {
    if ($event.target.files && $event.target.files[0]) {
      this.selectedImage = $event.target.files[0];
    }
  }
}
