import { Component } from '@angular/core';
import { AuthService } from '@services/auth/auth.service';
import { IUser } from '@models/user.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { Confirm, Notify, Report } from 'notiflix';
import { RouterModule } from '@angular/router';
import { SearchContainerComponent } from '../search-container/search-container.component';
import { LocationChooserComponent } from '../location-chooser/location-chooser.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SearchContainerComponent,
    LocationChooserComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  public showSearchBar: boolean = false;
  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}
  searchQuery: string;
  searchResults: any = {};
  typingTimer: any;
  searchDone: boolean = false;
  ngOnInit() {}
  logout() {
    Confirm.init({
      borderRadius: '5px',
      okButtonBackground: '#ff5861',
      titleColor: '#ff5861',
    });
    Confirm.show(
      'Confirm!',
      'Are you sure that you want to logout?',
      'Yes',
      'No',
      () => {
        this.authService.isLoggedIn$.subscribe((isLoggedIn: boolean) => {
          if (isLoggedIn) {
            this.authService.logout().subscribe((logout) => {
              console.log(logout);
              setTimeout(() => {
                window.location.href = '/';
              }, 1000);
              Notify.success('You have successfully logged out');
            });
          }
        });
      },
      () => {},
      {}
    );
  }
}
