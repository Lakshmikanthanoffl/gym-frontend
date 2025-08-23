import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Adjust path if needed
import Swal from 'sweetalert2';

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
      email: this.UserEmail,
      password: this.password
    };
  
    this.authService.login(loginData).subscribe({
      next: (role) => {
        this.authService.setRole(role.RoleName);
  
        // ✅ If subscription expired but role is superadmin, allow login
        if (role.RoleName === 'superadmin') {
          this.router.navigate(['/dashboard']);
          Swal.fire({
            icon: 'success',
            title: 'Welcome Back, Super Admin!',
            text: 'Login successful.',
            background: '#1a1a1a',
            color: '#eaeaea',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
        } else {
          // Normal users
          this.router.navigate(['/dashboard']);
          Swal.fire({
            icon: 'success',
            title: 'Welcome Back!',
            text: 'Login successful.',
            background: '#1a1a1a',
            color: '#eaeaea',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
        }
      },
      error: (err) => {
        if (err.status === 401) {
          if (err.error?.message === 'Invalid email or password') {
            Swal.fire({
              icon: 'error',
              title: 'Invalid Credentials',
              text: err.error.message,
              background: '#1a1a1a',
              color: '#eaeaea',
              confirmButtonColor: '#ff4d4d'
            });
          } else if (err.error?.message === 'Account expired. Please renew subscription.') {
            // ✅ Block only non-superadmins
            const role = this.authService.getRole();
            if (role !== 'superadmin') {
              Swal.fire({
                icon: 'warning',
                title: 'Subscription Expired',
                text: err.error.message,
                background: '#1a1a1a',
                color: '#eaeaea',
                confirmButtonColor: '#ff9900'
              });
            } else {
              // let superadmin continue to dashboard
              this.router.navigate(['/dashboard']);
            }
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Unauthorized',
              text: 'Unauthorized access. Please try again.',
              background: '#1a1a1a',
              color: '#eaeaea',
              confirmButtonColor: '#ff4d4d'
            });
          }
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Login Failed',
            text: 'Something went wrong. Please try again.',
            background: '#1a1a1a',
            color: '#eaeaea',
            confirmButtonColor: '#ff9900'
          });
        }
      }
    });
  }
  
  
  
  

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
