import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '@services/users/user.service';
import { AuthService } from '@services/auth/auth.service';
import { Report } from 'notiflix';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css'],
})
export class PasswordResetComponent {
  public currentPassword: string = '';
  public newPassword: string = '';
  public reenterNewPassword: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  resetPassword(): void {
    if (this.newPassword !== this.reenterNewPassword) {
      Report.failure('Error', 'New passwords do not match', 'Okay');
      return;
    }
    this.authService
      .resetPassword(this.currentPassword, this.newPassword)
      .subscribe({
        next: (v) => console.log(v),
        error: (e) => {
          Report.failure('Error', e.error.message, 'Okay');
        },
        complete: () =>
          Report.success(
            'Successfully reset password',
            'The password was reset successfully!',
            'Ok',
            () => {
              this.router.navigate(['/user', 'user-page']);
            }
          ),
      });
  }
}
