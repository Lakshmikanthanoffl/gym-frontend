import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { GymService } from './gym.service';
import { environment } from '../../environments/environment';
export interface Role {
  RoleId: number;
  RoleName: string;
  UserName: string;
  UserEmail: string;
  Password: string;
  GymId: number;
  GymName: string;
  IsActive: boolean;
  ValidUntil: string;  // ✅ from API
  PaidDate:string;
  Privileges: string[];  // ✅ add this
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private roleSubject = new BehaviorSubject<string | null>(localStorage.getItem('role'));
  role$ = this.roleSubject.asObservable();

  private usernameSubject = new BehaviorSubject<string | null>(localStorage.getItem('username'));
  username$ = this.usernameSubject.asObservable();

  private gymNameSubject = new BehaviorSubject<string | null>(localStorage.getItem('GymName'));
  gymName$ = this.gymNameSubject.asObservable();

  // ✅ new: subscription expiry subject
  private validUntilSubject = new BehaviorSubject<string | null>(localStorage.getItem('validUntil'));
  validUntil$ = this.validUntilSubject.asObservable();

  private PaidDateSubject = new BehaviorSubject<string | null>(localStorage.getItem('startDate'));
  startDate$ = this.PaidDateSubject.asObservable();

  // ✅ new subject for IsActive
  private isActiveSubject = new BehaviorSubject<boolean>(localStorage.getItem('isActive') === 'true');
  isActive$ = this.isActiveSubject.asObservable();
  // ✅ new subject for privileges
  private privilegesSubject = new BehaviorSubject<string[]>(this.getPrivileges());
  privileges$ = this.privilegesSubject.asObservable();

  private apiUrl = `${environment.apiBaseUrl}/api/Role/login`;

  constructor(private http: HttpClient, private router: Router,private gymService: GymService) {
    // ✅ Immediately check validity on service load
    this.checkValidity();

    // ✅ Run check every 30 seconds
    setInterval(() => {
      this.checkValidity();
    }, 30000);
  }

  private checkValidity() {
    const token = localStorage.getItem('authToken');
    const isActive = localStorage.getItem('isActive') === 'true';
    const validUntil = localStorage.getItem('validUntil');
  
    // ✅ Skip if not logged in
    if (!token) return;
  
    // ✅ Skip if already on login page
    if (this.router.url === '/login') return;
  
    if (!isActive) {
      this.forceLogout('Your account has been deactivated.');
      return;
    }
  
    if (validUntil && new Date(validUntil) < new Date()) {
      this.forceLogout('Your subscription has expired.');
      return;
    }
  
    // ✅ Update state normally if logged in and valid
    if (validUntil) {
      this.validUntilSubject.next(validUntil);
    }
    this.isActiveSubject.next(isActive);
  }
  
  

  forceLogout(message: string) {
    this.clearAuth();
    this.router.navigate(['/login']);
    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        icon: 'warning',
        title: 'Session Ended',
        text: message,
        background: '#1a1a1a',
        color: '#f0f0f0',
        confirmButtonColor: '#ff4d4d'
      });
    });
  }
  getPrivileges(): string[] {
    const privileges = localStorage.getItem('privileges');
    return privileges ? JSON.parse(privileges) : [];
  }
  
  login(loginData: { email: string; password: string }): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, loginData).pipe(
      tap(role => {
        localStorage.setItem('authToken', 'dummy-token');
        localStorage.setItem('role', role.RoleName);
        localStorage.setItem('username', role.UserName);
        localStorage.setItem('GymName', role.GymName);
        localStorage.setItem('GymId', role.GymId.toString());
        localStorage.setItem('RoleId', role.RoleId.toString());

        if (role.ValidUntil) {
          localStorage.setItem('validUntil', role.ValidUntil);
          this.validUntilSubject.next(role.ValidUntil);
        }
        if (role.PaidDate) {
          localStorage.setItem('startDate', role.PaidDate);
          this.PaidDateSubject.next(role.PaidDate);
        }
        localStorage.setItem('isActive', role.IsActive ? 'true' : 'false');
        this.isActiveSubject.next(role.IsActive);
        if (role.Privileges) {
          localStorage.setItem('privileges', JSON.stringify(role.Privileges));
        }
        
        this.roleSubject.next(role.RoleName);
        this.usernameSubject.next(role.UserName);
        this.gymNameSubject.next(role.GymName);
        this.gymService.setGymById(role.GymId); // example gymId
        // ✅ immediately check after login
        this.checkValidity();
      })
    );
  }

  // Set role manually
  setRole(role: string) {
    localStorage.setItem('authToken', 'dummy-token');
    localStorage.setItem('role', role);
    this.roleSubject.next(role);
  }

  // Get role
  getRole(): string | null {
    return localStorage.getItem('role');
  }
// ✅ Update method to set privileges dynamically
setPrivileges(privileges: string[]) {
  localStorage.setItem('privileges', JSON.stringify(privileges));
  this.privilegesSubject.next(privileges);
}
  // Get username
  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  // ✅ Get validUntil directly
  getValidUntil(): string | null {
    return localStorage.getItem('validUntil');
  }

  // Logout / clear auth
  clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('GymName');
    localStorage.removeItem('GymId');
    localStorage.removeItem('validUntil');
    localStorage.removeItem('isActive');

    this.roleSubject.next(null);
    this.usernameSubject.next(null);
    this.gymNameSubject.next(null);
    this.validUntilSubject.next(null);
    this.isActiveSubject.next(false);
  }

  // Check if logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }
}
