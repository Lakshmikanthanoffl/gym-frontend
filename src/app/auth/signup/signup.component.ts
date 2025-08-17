import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']  // corrected typo
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

  private apiUrl = 'https://gymmanagementapi.onrender.com/api/Role'; // your signup API endpoint

  constructor(private router: Router, private http: HttpClient) {}

  signup() {
    const signupData = {
      roleId: this.roleId,
      roleName: this.roleName,
      userName: this.userName,
      userEmail: this.userEmail,
      password: this.password,
      gymId: 0,           // ✅ Added
      gymName: ""   // ✅ Added
    };
  
    this.http.post(this.apiUrl, signupData).subscribe({
      next: (response) => {
        alert('Signup successful!');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        alert('Signup failed, please try again.');
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
