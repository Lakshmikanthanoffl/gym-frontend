import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

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

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // ✅ Role updates
    this.authService.role$.subscribe(role => {
      this.userrole = role;
    });

    // ✅ Gym name updates
    this.authService.gymName$.subscribe(name => {
      this.defaultGymName = name;
    });

    // ✅ Expiry date updates (live, no refresh needed)
    this.authService.validUntil$.subscribe(validUntil => {
      this.updateExpiryStatus(validUntil);
    });
  }

  private updateExpiryStatus(expiryDateStr: string | null) {
    // Reset first
    this.showBellIcon = false;
    this.bellIsRed = false;

    if (expiryDateStr) {
      const expiryDate = new Date(expiryDateStr);
      const now = new Date();
      const diff = expiryDate.getTime() - now.getTime();
      const daysLeft = diff / (1000 * 60 * 60 * 24);

      if (daysLeft > 0 && daysLeft <= 7) {
        this.showBellIcon = true;

        // 🔴 Expiring today
        if (daysLeft <= 1) {
          this.bellIsRed = true;
        }
      }
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
