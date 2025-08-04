import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@services/auth/auth.service';
import { map, switchMap, take } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  console.log('AuthGuard activated');
  const authService = inject(AuthService);
  const router = inject(Router);
  const rolesSet = route.data['roles'];

  return authService.isLoggedIn$.pipe(
    take(1),
    switchMap((isLoggedIn) => {
      if (isLoggedIn) {
        const userType = authService.getCurrentUser()?.type;
        if (rolesSet && rolesSet.includes(userType)) {
          return of(true);
        } else if (rolesSet && !rolesSet.includes(userType)) {
          router.navigate(['/unauthorized']);
          return of(false);
        }
        return of(true);
      } else {
        router.navigate(['/login']);
        return of(false);
      }
    })
  );
};
