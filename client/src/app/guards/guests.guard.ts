import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@services/auth/auth.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const guestsGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    take(1),
    map((isLoggedIn) => {
      if (isLoggedIn) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};
