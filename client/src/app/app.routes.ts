import { Routes, ExtraOptions } from '@angular/router';
import { LoginComponent } from './pages/user/login/login.component';
import { RegisterComponent } from './pages/user/register/register.component';
import { authGuard } from './guards/auth.guard';
import { EventComponent } from './pages/event/event/event.component';
import { ArtistPageComponent } from './pages/artist/artist-page/artist-page.component';
import { BecomeAnArtistComponent } from './pages/artist/become-an-artist/become-an-artist.component';
import { EventFormComponent } from './pages/event/event-form/event-form.component';
import { ManageEventsComponent } from './pages/event/manage-events/manage-events.component';
import { guestsGuard } from './guards/guests.guard';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { UserPageComponent } from './pages/user/profile/user-page.component';
import { AdvancedSearchComponent } from './pages/advanced-search/advanced-search.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { PasswordResetComponent } from './pages/user/reset-password/password-reset.component';
import { ManageBeatfinderArtistComponent } from './pages/artist/manage-beatfinder-artist/manage-beatfinder-artist.component';
import { ManageUsersComponent } from './pages/user/manage-users/manage-users.component';
import { EditUserComponent } from './pages/user/edit-user/edit-user.component';
import { ManageArtistsComponent } from './pages/artist/manage-artists/manage-artists.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestsGuard] },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestsGuard],
  },
  { path: 'e/:eventId', component: EventComponent },
  { path: 'a/:artistId', component: ArtistPageComponent },
  {
    path: 'event',
    children: [
      {
        path: 'add',
        component: EventFormComponent,
        canActivate: [authGuard],
        data: { roles: ['Artist'] },
      },
      {
        path: 'edit/:id',
        component: EventFormComponent,
        canActivate: [authGuard],
        data: { roles: ['Artist', 'Admin'] },
      },
      {
        path: 'manage',
        component: ManageEventsComponent,
        canActivate: [authGuard],
        data: { roles: ['Artist', 'Admin'] },
      },
    ],
  },
  {
    path: 'artist',
    children: [
      {
        path: 'become',
        component: BecomeAnArtistComponent,
        data: { roles: ['User'] },
        canActivate: [authGuard],
      },
      {
        path: 'edit',
        component: ManageBeatfinderArtistComponent,
        canActivate: [authGuard],
        data: { roles: ['Artist', 'Admin'] },
      },
      {
        path: 'edit/:id',
        component: ManageBeatfinderArtistComponent,
        canActivate: [authGuard],
        data: { roles: ['Artist', 'Admin'] },
      },
      {
        path: 'manage',
        component: ManageArtistsComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
      },
    ],
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  {
    path: 'user',
    children: [
      {
        path: 'user-page',
        component: UserPageComponent,
        canActivate: [authGuard],
        data: { roles: ['Artist', 'Admin', 'User'] },
      },
      {
        path: 'password-reset',
        component: PasswordResetComponent,
        canActivate: [authGuard],
        data: { roles: ['Artist', 'Admin', 'User'] },
      },
      {
        path: 'manage-users',
        component: ManageUsersComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
      },
      {
        path: 'edit-user/:id',
        component: EditUserComponent,
        canActivate: [authGuard],
        data: { roles: ['Artist', 'Admin', 'User'] },
      },
    ],
  },
  // { path: 'settings', component: SettingsComponent },
  {
    path: 'search',
    component: AdvancedSearchComponent,
  },
  {
    path: '',
    component: MainPageComponent,
  },
];
