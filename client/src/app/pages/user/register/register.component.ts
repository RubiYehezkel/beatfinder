import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserService } from '@services/users/user.service';
import { IUser } from '@models/user.model';
import { PopularGenresList } from 'app/utils/genres';
import { Router } from '@angular/router';
import { Notify, Report } from 'notiflix';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  user: IUser = {
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    type: 'User',
    favArtists: [],
    favGenres: [],
  };
  public popularGenres = PopularGenresList;
  errorMessage: string = '';

  constructor(private userService: UserService, private router: Router) {}

  register(): void {
    this.userService.createUser(this.user).subscribe({
      next: (v) => console.log(v),
      error: (e) => {
        Report.failure('Error', e.error.message, 'Okay');
      },
      complete: () => {
        Notify.success('You have successfully registerd!');
        this.router.navigate(['/login']);
      },
    });
  }
}
