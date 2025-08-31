import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  roleId = 0;
  roleName = 'user';
  userName = '';
  userEmail = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  isPasswordStrong = false;

  private apiUrl = 'https://localhost:44363/api/Role';

  constructor(private router: Router, private http: HttpClient) {}

  signup() {
    const signupData = {
      roleId: this.roleId,
      roleName: this.roleName,
      userName: this.userName,
      userEmail: this.userEmail,
      password: this.password,
      gymId: 0,
      gymName: ""
    };
  
    this.http.post(this.apiUrl, signupData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Signup Successful',
          text: 'Your account has been created successfully!',
          background: '#1e1e1e',   // dark theme
          color: '#f1f1f1',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Signup Failed',
          text: 'Something went wrong. Please try again.',
          background: '#1e1e1e',
          color: '#f1f1f1',
          confirmButtonColor: '#d33'
        });
        console.error('Signup error:', error);
      }
    });
  }
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  validatePassword() {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    this.isPasswordStrong = strongPasswordRegex.test(this.password);
  }

  doPasswordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }
}
