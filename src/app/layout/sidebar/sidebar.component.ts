import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { GymService } from '../../services/gym.service';
import { SidebarService } from '../../services/sidebar.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  userrole: string | null = null;
  defaultGymName!: string | null;
  showBellIcon: boolean = false;
  bellIsRed: boolean = false;

  sidebarOpen: boolean = false; // controlled by SidebarService
  username!: string | null;

  constructor(
    private authService: AuthService,
    private gymService: GymService,
    private sidebarService: SidebarService,
    private router: Router
  ) {}

  ngOnInit() {
    // ✅ Subscribe to SidebarService for responsive toggle
    this.sidebarService.sidebarOpen$.subscribe(state => {
      this.sidebarOpen = state;
    });

    // ✅ Role updates
    this.authService.role$.subscribe(role => {
      this.userrole = role;
    });

    // ✅ Gym name updates
    this.authService.gymName$.subscribe(name => {
      this.defaultGymName = name;
    });
    this.authService.username$.subscribe(username => {
      this.username = username;
    });
    // ✅ Expiry date updates
    this.authService.validUntil$.subscribe(validUntil => {
      this.updateExpiryStatus(validUntil);
    });

    // ✅ Sync gym service name
    this.gymService.currentGym$.subscribe(name => {
      this.defaultGymName = name;
    });
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
        this.gymService.logout();
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
  private updateExpiryStatus(expiryDateStr: string | null) {
    this.showBellIcon = false;
    this.bellIsRed = false;

    if (expiryDateStr) {
      const expiryDate = new Date(expiryDateStr);
      const now = new Date();
      const diff = expiryDate.getTime() - now.getTime();
      const daysLeft = diff / (1000 * 60 * 60 * 24);

      if (daysLeft > 0 && daysLeft <= 7) {
        this.showBellIcon = true;

        if (daysLeft <= 1) {
          this.bellIsRed = true;
        }
      }
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // ✅ Responsive toggle via service
  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  // ✅ Auto close on mobile when menu item clicked
  closeSidebarOnMobile() {
    if (window.innerWidth < 992) {
      this.sidebarService.closeSidebar();
    }
  }
}
