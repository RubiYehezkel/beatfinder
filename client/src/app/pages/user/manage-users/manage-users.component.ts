import { Component, NgModule, OnInit } from '@angular/core';
import { EventService } from '@services/event/event.service';
import { numToShortMonth } from 'app/utils/date';
import { Confirm, Notify, Report } from 'notiflix';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Router, RouterModule } from '@angular/router';
import { UserService } from '@services/users/user.service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css',
})
export class ManageUsersComponent implements OnInit {
  constructor(private userService: UserService) {}
  public usersList: any = {};
  ngOnInit() {
    this.loadUsers();
  }
  loadUsers() {
    this.usersList = {};
    this.userService.getUsers().subscribe((users) => {
      this.usersList = users;
    });
  }
  getMonthName(monthName: string) {
    return numToShortMonth(parseInt(monthName));
  }
  deleteUser(userId: string) {
    Confirm.init({
      borderRadius: '5px',
      okButtonBackground: '#ff5861',
      titleColor: '#ff5861',
    });
    Confirm.show(
      'Confirm!',
      'Are you sure that you want to delete this user?',
      'Yes',
      'No',
      () => {
        this.userService.deleteUser(userId).subscribe({
          next: () => {},
          error: () => {
            Notify.init({
              position: 'right-bottom',
            });
            Notify.failure('Something went wrong.');
          },
          complete: () => {
            Notify.init({
              position: 'right-bottom',
            });
            Notify.success('User deleted successfully.');
            this.loadUsers();
          },
        });
      },
      () => {},
      {}
    );
  }
}
