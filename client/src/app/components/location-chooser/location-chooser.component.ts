import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-location-chooser',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './location-chooser.component.html',
  styleUrl: './location-chooser.component.css',
})
export class LocationChooserComponent implements OnInit {
  constructor(private apiService: ApiService) {}
  public showLocationContainer: boolean = false;
  public searchQuery: string = '';
  public searchResults: any = [];
  private debounceTime = 1000;
  private typingTimer: any;
  public userLocation: {
    city: string;
    country: string;
  };
  ngOnInit(): void {
    this.userLocation = this.loadLocation();
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
    let userLocation = location.split(',');
    localStorage.setItem(
      'userLocation',
      JSON.stringify({
        city: userLocation[0].trim(),
        country: userLocation[1].trim(),
      })
    );
    this.userLocation = this.loadLocation();
    this.showLocationContainer = false;
    window.location.reload();
  }
  loadLocation() {
    return JSON.parse(localStorage.getItem('userLocation')!);
  }
}
