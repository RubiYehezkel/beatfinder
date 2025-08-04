import { Component, OnInit } from '@angular/core';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { AuthService } from '@services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  public showLoadingIndicator = true;
  title = 'beatfinder';

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!localStorage.getItem('userLocation')) {
      localStorage.setItem(
        'userLocation',
        JSON.stringify({
          city: 'London',
          country: 'Great Britain',
        })
      );
    }
    this.authService.getCurrentUserFromApi();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.showLoadingIndicator = true;
      } else if (event instanceof NavigationEnd) {
        this.showLoadingIndicator = false;
      }
    });
  }
}
