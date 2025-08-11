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
  UserEmail = '';
  password = '';
  showPassword = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  login() {
    const loginData = {
      email: this.UserEmail, // or this.email if you renamed the field
      password: this.password
    };
  
    this.authService.login(loginData).subscribe({
      next: (role) => {
        this.authService.setRole(role.RoleName);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        if (err.status === 401) {
          alert('Invalid credentials');
        } else {
          alert('Login failed. Please try again.');
        }
      }
    });
  }
  
  

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
