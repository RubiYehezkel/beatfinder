import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@services/auth/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Report, Notify } from 'notiflix';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  email: string;
  password: string;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (params) => {
      if (params['code']) {
        await this.authService.spotifyLogin();
      }
    });
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) this.router.navigate(['/']);
    });
  }

  login(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: (v) => console.log(v),
      error: (e) => {
        Report.failure('Error', e.error.message, 'Okay');
      },
      complete: () => Notify.success('You have successfully logged in!'),
    });
  }

  async loginWithSpotify() {
    await this.authService.spotifyLogin();
  }
}
