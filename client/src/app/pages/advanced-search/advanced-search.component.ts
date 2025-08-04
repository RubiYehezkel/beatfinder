import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AfterViewInit } from '@angular/core';
import { easepick } from '@easepick/bundle';
import { PopularGenresList } from 'app/utils/genres';
import { ApiService } from '@services/api.service';
import { FormBuilder } from '@angular/forms';
import { DatePipe, NgFor } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from '@m3rlin94/ngx-pagination';
import { LocationChooserMiniComponent } from 'app/components/location-chooser-mini/location-chooser-mini.component';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    DatePipe,
    RouterModule,
    NgxPaginationModule,
    NgFor,
    LocationChooserMiniComponent,
    RouterModule,
  ],
  templateUrl: './advanced-search.component.html',
  styleUrl: './advanced-search.component.css',
})
export class AdvancedSearchComponent implements AfterViewInit {
  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {}
  @ViewChild('easepick') easepick: any;
  @ViewChild('location') locationinput: any;
  public popularGenres = PopularGenresList;
  public userLocation: {
    city: string;
    country: string;
  };
  public picker: any;
  public searchForm = this.fb.group({
    searchQuery: [''],
    location: [''],
    dateRange: [''],
    selectedGenre: [''],
  });
  public searchResults: any = {};
  public searchDone = false;
  public searchInitiated = false;
  p: number = 1;

  ngAfterViewInit(): void {
    this.picker = new easepick.create({
      element: '#datepicker',
      css: [
        'https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.1/dist/index.css',
      ],
      zIndex: 99999,
      firstDay: 0,
      grid: 2,
      calendars: 1,
      plugins: ['RangePlugin'],
    });
    this.route.queryParams.subscribe(async (params) => {
      if (params['genre']) {
        this.searchForm.controls.selectedGenre.setValue(params['genre']);
        this.doSearch();
      }
    });
  }
  loadLocation() {
    return JSON.parse(localStorage.getItem('userLocation')!);
  }
  doSearch() {
    this.searchInitiated = true;
    this.searchDone = false;
    this.p = 1;
    let searchFilters = {
      keyword:
        this.searchForm.value.searchQuery?.length == 0
          ? undefined
          : this.searchForm.value.searchQuery,
      city:
        this.searchForm.value.location?.length == 0
          ? this.loadLocation().city
          : this.searchForm.value.location?.split(',')[0],
      startDateTime: this.picker.getStartDate()?.format('YYYY-MM-DD'),
      endDateTime: this.picker.getEndDate()?.format('YYYY-MM-DD'),
      genres:
        this.searchForm.value.selectedGenre?.length == 0 ||
        this.searchForm.value.selectedGenre == null
          ? undefined
          : this.searchForm.value.selectedGenre,
    };
    console.log(searchFilters);
    this.apiService
      .get('search?filter=' + JSON.stringify(searchFilters), false)
      .subscribe((data) => {
        this.searchResults = data;
        this.searchDone = true;
      });
  }
}
