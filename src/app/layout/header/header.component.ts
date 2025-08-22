import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // adjust the path
import Swal from 'sweetalert2';

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
export class HeaderComponent implements OnInit {
  
  headerTitle = 'Dashboard';
  
  popupVisible = false;

  @ViewChild('logoutItem') logoutItem!: ElementRef;
  userrole: any;
  username: any;
 
  constructor(private router: Router, private activatedRoute: ActivatedRoute,private authService: AuthService) {
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

  ngOnInit() {
    this.authService.role$.subscribe(role => {
      this.userrole = role;
    });
    this.authService.username$.subscribe(username => {
      this.username = username;
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
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout!',
      cancelButtonText: 'Cancel',
      background: '#1e1e1e', // dark background
      color: '#ffffff',       // white text
      customClass: {
        popup: 'dark-popup',
        title: 'dark-title',
        confirmButton: 'dark-confirm',
        cancelButton: 'dark-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('role');
      
        Swal.fire({
          title: 'Logged Out',
          text: 'You have successfully logged out.',
          icon: 'success',
          background: '#1e1e1e',   // Dark popup background
          color: '#ffffff',        // White text
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          backdrop: `
            rgba(0, 0, 0, 0.95)   /* Black overlay background */
          `,
          customClass: {
            popup: 'dark-popup'    // For extra styling if needed
          }
        }).then(() => {
          this.router.navigate(['/login']);
        });
      }
    });
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
