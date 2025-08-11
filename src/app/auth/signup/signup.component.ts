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

  private apiUrl = 'https://gymmanagementapi-production-offl.up.railway.app/api/Role'; // your signup API endpoint

  constructor(private router: Router, private http: HttpClient) {}

  signup() {
    const signupData = {
      roleId: this.roleId,
      roleName: this.roleName,
      userName: this.userName,
      userEmail: this.userEmail,
      password: this.password
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
}
