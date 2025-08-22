import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import Swal from 'sweetalert2';
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
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please login to continue.',
        confirmButtonText: 'OK',
        background: '#1e1e1e',   // black background
        color: '#f1f1f1',        // light text
        confirmButtonColor: '#3085d6'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return false;
    }

    if (requiredRoles && !requiredRoles.includes(userRole || '')) {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'You do not have permission to access this page.',
        confirmButtonText: 'Go Back',
        background: '#1e1e1e',
        color: '#f1f1f1',
        confirmButtonColor: '#d33'
      }).then(() => {
        this.router.navigate(['/dashboard']);
      });
      return false;
    }

    return true;
  }
}
