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
    const userRole = localStorage.getItem('role') || '';
    const userPrivileges = JSON.parse(localStorage.getItem('privileges') || '[]') as string[];
    const requiredRoles = route.data['roles'] as string[] || [];
    const requiredPrivileges = route.data['privileges'] as string[] || [];

    const currentUrl = this.router.url;

    // Always allow login page
    if (currentUrl === '/login') return true;

    // Not logged in
    if (!isLoggedIn) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please login to continue.',
        confirmButtonText: 'OK',
        background: '#1e1e1e',
        color: '#f1f1f1',
        confirmButtonColor: '#3085d6',
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then(() => this.router.navigate(['/login']));
      return false;
    }

    // Superadmin bypass
    if (userRole.toLowerCase() === 'superadmin') return true;

    // Role restriction
    if (requiredRoles.length && !requiredRoles.includes(userRole)) {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'You do not have permission to access this page.',
        confirmButtonText: 'Go Back',
        background: '#1e1e1e',
        color: '#f1f1f1',
        confirmButtonColor: '#d33',
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then(() => this.router.navigate(['/members']));
      return false;
    }

    // Privilege restriction
    if (requiredPrivileges.length) {
      if (requiredPrivileges.some(p => !userPrivileges.includes(p))) {
        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'You do not have the required privileges to access this page.',
          confirmButtonText: 'Go Back',
          background: '#1e1e1e',
          color: '#f1f1f1',
          confirmButtonColor: '#d33',
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then(() => this.router.navigate(['/members']));
        return false;
      }
    }

    return true;
  }
}
