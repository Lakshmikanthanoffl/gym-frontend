import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const isLoggedIn = !!localStorage.getItem('authToken');
    const userRole = localStorage.getItem('role');
    const requiredRoles = route.data['roles'] as string[]; // Optional role check

    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check role access if defined
    if (requiredRoles && !requiredRoles.includes(userRole || '')) {
      alert('Access denied. You do not have permission to access this page.');
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
