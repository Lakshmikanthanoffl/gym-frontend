import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private roleSubject = new BehaviorSubject<string | null>(localStorage.getItem('role'));
  role$ = this.roleSubject.asObservable();

  setRole(role: string) {
    localStorage.setItem('authToken', 'dummy-token');
    localStorage.setItem('role', role);
    this.roleSubject.next(role);
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    this.roleSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }
}
