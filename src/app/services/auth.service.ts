import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Role {
  RoleId: number;
  RoleName: string;
  UserName: string;
  UserEmail: string;
  Password: string;
  GymId: number;
  GymName: string;
  IsActive: boolean;
  ValidUntil: string;  // ✅ Add this (as string from API)
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

  private apiUrl = 'https://gymmanagementapi.onrender.com/api/Role/login'; // adjust API URL

  constructor(private http: HttpClient) {}

  login(loginData: { email: string; password: string }): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, loginData).pipe(
      tap(role => {
        localStorage.setItem('authToken', 'dummy-token');
        localStorage.setItem('role', role.RoleName);
        localStorage.setItem('username', role.UserName);
        localStorage.setItem('GymName', role.GymName);
        localStorage.setItem('GymId', role.GymId.toString());
  
        if (role.ValidUntil) {
          localStorage.setItem('validUntil', role.ValidUntil.toString()); // ✅ corrected
        }
  
        this.roleSubject.next(role.RoleName);
        this.usernameSubject.next(role.UserName);
        this.gymNameSubject.next(role.GymName);
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

  // Get username
  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  // Logout / clear auth
  clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('GymName');
    localStorage.removeItem('GymId');
    localStorage.removeItem('isActive');

    this.roleSubject.next(null);
    this.usernameSubject.next(null);
    this.gymNameSubject.next(null);
  }

  // Check if logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }
}
