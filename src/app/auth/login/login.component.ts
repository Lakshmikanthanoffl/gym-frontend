import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit() {
    if (localStorage.getItem('authToken')) {
      this.router.navigate(['/dashboard']);
    }
  }

  login() {
    // Dummy login logic (replace with real API call later)
    if (this.username === 'admin' && this.password === 'admin') {
      localStorage.setItem('authToken', 'dummy-token');
      this.router.navigate(['/dashboard']);
    } else {
      alert('Invalid credentials');
    }
  }
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
