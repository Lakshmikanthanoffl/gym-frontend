import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Adjust path if needed
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  showPassword = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  login() {
    if (this.username === 'admin' && this.password === 'admin') {
      this.authService.setRole('admin');
      this.router.navigate(['/dashboard']);
    } else if (this.username === 'user' && this.password === 'user') {
      this.authService.setRole('user');
      this.router.navigate(['/dashboard']);
    } else {
      alert('Invalid credentials');
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
