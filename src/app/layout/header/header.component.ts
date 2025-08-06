import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  animations: [
    trigger('popupAnimation', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(-10px)',
        display: 'none'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)',
        display: 'block'
      })),
      transition('hidden => visible', [
        style({ display: 'block' }),
        animate('200ms ease-in')
      ]),
      transition('visible => hidden', [
        animate('200ms ease-out', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ]),
    ]),
  ]
})
export class HeaderComponent {
  headerTitle = 'Dashboard';
  username = 'Admin';
  popupVisible = false;

  @ViewChild('logoutItem') logoutItem!: ElementRef;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route.snapshot.data['title'] || 'Dashboard';
        })
      )
      .subscribe((title: string) => {
        this.headerTitle = title;
      });
  }

  togglePopup() {
    this.popupVisible = !this.popupVisible;

    if (this.popupVisible) {
      setTimeout(() => {
        this.logoutItem?.nativeElement.focus();
      }, 0);
    }
  }

  logout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent) {
    if (event.altKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      this.togglePopup();
    }

    // Focus logout item when popup is open and down arrow is pressed
    if (event.key === 'ArrowDown' && this.popupVisible) {
      event.preventDefault();
      this.logoutItem?.nativeElement.focus();
    }

    // Trigger logout on Enter if logoutItem is focused
    if (
      event.key === 'Enter' &&
      this.popupVisible &&
      document.activeElement === this.logoutItem?.nativeElement
    ) {
      event.preventDefault();
      this.logout();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.position-relative')) {
      this.popupVisible = false;
    }
  }
}
