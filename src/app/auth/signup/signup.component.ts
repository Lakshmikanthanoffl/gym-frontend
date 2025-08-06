import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  username = '';
  password = '';

  constructor(private router: Router) {}

  signup() {
    // Dummy signup logic
    alert('Signup successful!');
    this.router.navigate(['/login']);
  }
}
