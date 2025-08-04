import { Component, Input, OnInit, forwardRef } from '@angular/core';
import {
  FormsModule,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
} from '@angular/forms';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-location-chooser-mini',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './location-chooser-mini.component.html',
  styleUrls: ['./location-chooser-mini.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocationChooserMiniComponent),
      multi: true,
    },
  ],
})
export class LocationChooserMiniComponent
  implements OnInit, ControlValueAccessor
{
  public showLocationContainer: boolean = false;
  public searchQuery: string = '';
  public searchResults: any = [];
  private debounceTime = 1000;
  private typingTimer: any;
  public storedLocation: { city: string; country: string } = {
    city: '',
    country: '',
  };
  @Input('useSavedLocation') useSavedLocation: boolean;
  public userLocation: string = '';
  public onChange: (value: any) => void = () => {};
  public onTouched: () => void = () => {};

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    if (this.useSavedLocation) {
      this.searchQuery =
        this.loadLocation().city + ', ' + this.loadLocation().country;
    }
  }

  fetchLocations(): void {
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.apiService
        .get(`search/location?keyword=${this.searchQuery}`, false)
        .subscribe((data) => {
          this.searchResults = data.response;
          console.log(this.searchResults);
        });
    }, this.debounceTime);
  }

  chooseLocation(location: any): void {
    this.searchQuery = location;
    this.searchResults = {};
    this.userLocation = location;
    this.onChange(this.userLocation);
    this.onTouched();
  }

  loadLocation() {
    return JSON.parse(localStorage.getItem('userLocation')!);
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    if (value) {
      this.userLocation = value;
      this.searchQuery = value.city || '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Handle the disabled state if needed
  }
}
