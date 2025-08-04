import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IUser } from '@models/user.model';
import { UserService } from '@services/users/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopularGenresList } from 'app/utils/genres';
import { NgSelectModule } from '@ng-select/ng-select';
import { Report, Notify } from 'notiflix';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [RouterModule, FormsModule, NgSelectModule, ReactiveFormsModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.css',
})
export class EditUserComponent implements OnInit {
  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}
  private _userId: string;
  public _userData: IUser;
  public popularGenres = PopularGenresList;
  editUserForm: FormGroup;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this._userId = params['id'];
      this.userService.getUser(this._userId).subscribe((userData) => {
        this._userData = userData;
        this.editUserForm = this.fb.group({
          firstName: [this._userData.firstName],
          lastName: [this._userData.lastName],
          email: [this._userData.email],
          type: [this._userData.type],
        });
      });
    });
  }
  onSubmit() {
    this.userService
      .updateUser(this._userId, this.editUserForm.value)
      .subscribe({
        next: (v) => console.log(v),
        error: (e) => {
          Report.failure('Error', e.error.message, 'Okay');
        },
        complete: () => {
          Notify.success('The user has been edited succsesfully!');
        },
      });
  }
  changeUserLevel(e: any) {
    this.editUserForm.patchValue({ type: e.target.value });
  }
}
