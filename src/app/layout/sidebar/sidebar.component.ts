import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Adjust path
@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit{
  userrole: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Subscribe to role changes so sidebar updates immediately on login
    this.authService.role$.subscribe(role => {
      this.userrole = role;
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
