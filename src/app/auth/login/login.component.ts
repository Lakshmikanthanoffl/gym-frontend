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
  showContactUs = false; // ✅ Flag to show Contact Us link

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
        this.showContactUs = false; // reset flag on successful login

        if (role.RoleName === 'superadmin') {
          this.router.navigate(['/dashboard']);
          Swal.fire({
            icon: 'success',
            title: `<span style="color:#ffd700; font-size:28px; font-weight:700; text-shadow:0 0 10px #ffcc00;">👑 Welcome Back, Super Admin ${role.UserName}!</span>`,
            html: `<p style="font-size:18px; color:#eaeaea; margin-top:10px;">
                     You have full access to the system.
                   </p>`,
            background: '#0d0d0d',
            color: '#ffffff',
            width: 600,   // ✅ Bigger popup
            showConfirmButton: false,
            timer: 2800,
            timerProgressBar: true,
            backdrop: `
              rgba(0,0,0,0.8)
              url("https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif")
              center top
              no-repeat
            `, // ✅ Animated glowing backdrop
          });
        } else {
          this.router.navigate(['/dashboard']);
          Swal.fire({
            icon: 'success',
            title: `Welcome Back, ${role.UserName}!`,
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
            this.showContactUs = true; // ✅ Show Contact Us link for non-superadmins
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

  // ✅ New method to show Contact Us popup
  openContactUsPopup() {
    Swal.fire({
      title: `<strong style="font-size: 24px; font-weight:600; color:#ffffff;">Contact Us</strong>`,
      html: `
        <div style="text-align: left; margin-top: 15px; font-size: 17px; line-height: 1.8; font-family: 'Segoe UI', Tahoma, sans-serif;">
          
          <p style="margin: 8px 0;">
            <strong style="color:#0d6efd;">Email:</strong><br>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=lakshmikanthan.b.2001@gmail.com" 
               target="_blank"
               style="color:#f0f0f0; text-decoration:none; font-weight:500; margin-right:10px;">
              lakshmikanthan.b.2001&#64;gmail.com
            </a>
            <button id="copyEmailBtn"
              style="padding:3px 8px; font-size:12px; background:#0d6efd; color:#fff; border:none; border-radius:6px; cursor:pointer;">
              Copy
            </button>
          </p>
          
          <p style="margin: 12px 0;">
            <strong style="color:#0d6efd;">Phone:</strong><br>
            <a href="tel:+919025275948" 
               style="color:#f0f0f0; text-decoration:none; font-weight:500;">
              +91 9025275948
            </a>
          </p>
  
        </div>
      `,
      background: '#1f1f1f',
      color: '#f0f0f0',
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Close',
      confirmButtonColor: '#0d6efd',
      focusConfirm: false,
      customClass: {
        popup: 'swal-popup-professional',
        title: 'swal-title-professional'
      },
      didOpen: () => {
        const copyBtn = document.getElementById("copyEmailBtn");
        if (copyBtn) {
          copyBtn.addEventListener("click", async () => {
            await navigator.clipboard.writeText("lakshmikanthan.b.2001@gmail.com");
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Email copied!',
              background: '#2b2b2b',   // Dark toast background
              color: '#f0f0f0',        // Light text
              iconColor: '#0d6efd',    // Blue success icon
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
            });
          });
        }
      }
    });
  }
  
  
}
