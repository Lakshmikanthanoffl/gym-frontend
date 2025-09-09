import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkMode = true;
  
  // Observable to notify components
  private themeSubject = new BehaviorSubject<'dark' | 'light'>('dark');
  theme$ = this.themeSubject.asObservable();

  constructor() {
    this.loadTheme();
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
    this.themeSubject.next(this.darkMode ? 'dark' : 'light');
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    this.darkMode = savedTheme !== 'light'; // default dark
    this.applyTheme();
    this.themeSubject.next(this.darkMode ? 'dark' : 'light');
  }

  private applyTheme(): void {
    if (this.darkMode) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }

  isDarkMode(): boolean {
    return this.darkMode;
  }
}
