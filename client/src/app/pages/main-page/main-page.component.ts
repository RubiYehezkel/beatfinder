import { Component, OnInit } from '@angular/core';
import { PopularGenresList } from 'app/utils/genres';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { ApiService } from '@services/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, fromEvent } from 'rxjs';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css',
})
export class MainPageComponent implements OnInit {
  public popularGenres = PopularGenresList;
  public mainPageData: any = {};
  constructor(
    public authService: AuthService,
    public router: Router,
    public apiService: ApiService,
    private sanitizer: DomSanitizer
  ) {}
  ngOnInit(): void {
    this.apiService
      .get(
        'search/popular?location=' + localStorage.getItem('userLocation'),
        true
      )
      .subscribe((data) => {
        this.mainPageData = data;
      });
  }

  loadLocation() {
    return JSON.parse(localStorage.getItem('userLocation')!);
  }

  public getSantizeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
