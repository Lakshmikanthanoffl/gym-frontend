import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkMode = true;
  
  private themeSubject = new BehaviorSubject<'dark' | 'light'>('dark');
  theme$ = this.themeSubject.asObservable();

  constructor() {
    this.loadTheme();
  }

  toggleTheme(): void {
    const body = document.body;
  
    // Add wipe overlay
    body.classList.add('theme-wipe');
  
    // Switch theme
    this.darkMode = !this.darkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
    this.themeSubject.next(this.darkMode ? 'dark' : 'light');
  
    // Remove class after animation completes
    setTimeout(() => {
      body.classList.remove('theme-wipe');
    }, 700); // must match animation duration
  }
  

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    this.darkMode = savedTheme !== 'light';
    this.applyTheme();
    this.themeSubject.next(this.darkMode ? 'dark' : 'light');
  }

  private applyTheme(): void {
    const body = document.body;
    if (this.darkMode) {
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
    }
  }

  isDarkMode(): boolean {
    return this.darkMode;
  }
}
