import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Adjust path if needed
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';

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
      const userRole = (localStorage.getItem('role') || '').toLowerCase();
      const userPrivileges = JSON.parse(localStorage.getItem('privileges') || '[]') as string[];
  
      // Determine the first route based on role/privileges
      let firstRoute = '/members'; // default fallback
      if (userRole === 'superadmin') {
        firstRoute = '/dashboard';
      } else if (userPrivileges.includes('dashboard')) {
        firstRoute = '/dashboard';
      }
  
      // Navigate once to the correct route
      this.router.navigate([firstRoute]);
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
   // Determine the first route after login
const userRole = role.RoleName.toLowerCase();
const userPrivileges = role.Privileges || []; // make sure backend returns privileges array

let firstRoute = '/members'; // default fallback
if (userRole === 'superadmin') {
  firstRoute = '/dashboard';
} else if (userPrivileges.includes('dashboard')) {
  firstRoute = '/dashboard';
}

// Navigate once to the correct route
this.router.navigate([firstRoute]);
        if (role.RoleName === 'superadmin') {
          this.router.navigate(['/dashboard']);
        
          // Front confetti container
          const confettiContainer = document.createElement('div');
          confettiContainer.style.position = 'fixed';
          confettiContainer.style.top = '0';
          confettiContainer.style.left = '0';
          confettiContainer.style.width = '100%';
          confettiContainer.style.height = '100%';
          confettiContainer.style.pointerEvents = 'none';
          confettiContainer.style.zIndex = '9999';
          document.body.appendChild(confettiContainer);
        
          // Background glow container
          const glowContainer = document.createElement('div');
          glowContainer.style.position = 'fixed';
          glowContainer.style.top = '0';
          glowContainer.style.left = '0';
          glowContainer.style.width = '100%';
          glowContainer.style.height = '100%';
          glowContainer.style.pointerEvents = 'none';
          glowContainer.style.zIndex = '9998';
          document.body.appendChild(glowContainer);
        
          // Background glow circles
          for (let i = 0; i < 10; i++) {
            const circle = document.createElement('div');
            circle.style.position = 'absolute';
            circle.style.width = `${20 + Math.random() * 40}px`;
            circle.style.height = `${20 + Math.random() * 40}px`;
            circle.style.borderRadius = '50%';
            circle.style.background = 'radial-gradient(circle, #ffd70055, transparent)';
            circle.style.top = `${Math.random() * 100}%`;
            circle.style.left = `${Math.random() * 100}%`;
            circle.style.filter = 'blur(15px)';
            circle.style.opacity = '0.3';
            circle.style.animation = `floatGlow ${3 + Math.random() * 2}s ease-in-out infinite alternate`;
            glowContainer.appendChild(circle);
          }
        
          Swal.fire({
            html: `
              <div style="text-align:center; position:relative;">
                <!-- Rotating sparkling crown -->
                <div id="crown" style="
                  font-size:40px; 
                  margin-bottom:8px; 
                  animation: rotateCrown 1.5s linear infinite;
                  position: relative;
                ">
                  👑
                </div>
        
                <!-- Glowing gradient title -->
                <h2 style="
                  font-size:28px;
                  font-weight:900;
                  background: linear-gradient(90deg, #ffd700, #ffae00, #ff4500);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  text-shadow: 0 0 15px #ffd700, 0 0 30px #ffae00;
                  animation: glow 1s ease-in-out infinite alternate;
                ">
                  Welcome Back, Super Admin ${role.UserName}!
                </h2>
        
                <p style="font-size:16px; color:#eaeaea; margin-top:6px;">
                  You have <strong>full access</strong> to the system.<br/>
                  Enjoy your <span style="color:#ffd700;">premium privileges</span>!
                </p>
              </div>
        
              <style>
                @keyframes glow {
                  0% { text-shadow: 0 0 8px #ffd700, 0 0 16px #ffae00; }
                  50% { text-shadow: 0 0 16px #ffd700, 0 0 32px #ffae00; }
                  100% { text-shadow: 0 0 24px #ffd700, 0 0 48px #ffae00; }
                }
        
                @keyframes rotateCrown {
                  0% { transform: rotate(0deg); }
                  50% { transform: rotate(12deg); }
                  100% { transform: rotate(-12deg); }
                }
        
                @keyframes floatGlow {
                  0% { transform: translateY(0px) translateX(0px); opacity:0.3; }
                  50% { transform: translateY(-15px) translateX(8px); opacity:0.5; }
                  100% { transform: translateY(0px) translateX(-8px); opacity:0.3; }
                }
              </style>
            `,
            background: '#0d0d0d',
            width: 600,
            showConfirmButton: false,
            timer: 2800, // faster
            timerProgressBar: true,
            didOpen: () => {
              const crown = document.getElementById('crown');
        
              // Crown sparkles with gold dust trail
              const sparkleInterval = setInterval(() => {
                if (!crown) return;
        
                // Main sparkle
                const sparkle = document.createElement('div');
                sparkle.style.position = 'absolute';
                sparkle.style.width = '5px';
                sparkle.style.height = '5px';
                sparkle.style.backgroundColor = '#ffd700';
                sparkle.style.borderRadius = '50%';
                sparkle.style.top = `${Math.random() * 50}%`;
                sparkle.style.left = `${Math.random() * 50}%`;
                sparkle.style.boxShadow = '0 0 8px #ffd700, 0 0 12px #ffae00';
                sparkle.style.opacity = '1';
                sparkle.style.pointerEvents = 'none';
                sparkle.style.animation = 'fadeOutTrail 0.8s forwards';
                crown.appendChild(sparkle);
        
                // Gold dust trail
                for (let i = 0; i < 3; i++) {
                  const trail = document.createElement('div');
                  trail.style.position = 'absolute';
                  trail.style.width = `${2 + Math.random() * 2}px`;
                  trail.style.height = `${2 + Math.random() * 2}px`;
                  trail.style.backgroundColor = '#ffd700';
                  trail.style.borderRadius = '50%';
                  trail.style.top = `${Math.random() * 50}%`;
                  trail.style.left = `${Math.random() * 50}%`;
                  trail.style.opacity = '0.8';
                  trail.style.filter = 'blur(1px)';
                  trail.style.pointerEvents = 'none';
                  trail.style.animation = `fadeOutTrail ${0.8 + Math.random() * 0.4}s forwards`;
                  crown.appendChild(trail);
                  setTimeout(() => crown.removeChild(trail), 1200);
                }
        
                setTimeout(() => crown.removeChild(sparkle), 800);
              }, 120);
        
              const style = document.createElement('style');
              style.innerHTML = `
                @keyframes fadeOutTrail {
                  0% { opacity: 1; transform: scale(1); }
                  100% { opacity: 0; transform: scale(0.3) translateY(-4px); }
                }
              `;
              document.head.appendChild(style);
        
              // Confetti
              const duration = 2800;
              const animationEnd = Date.now() + duration;
        
              const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) {
                  clearInterval(interval);
                  clearInterval(sparkleInterval);
                  document.body.removeChild(confettiContainer);
                  document.body.removeChild(glowContainer);
                  return;
                }
        
                confetti({
                  particleCount: 4 + Math.random() * 4,
                  spread: 360,
                  origin: { x: Math.random(), y: Math.random() * 0.5 },
                  colors: ['#ffd700', '#ffae00', '#ff4500', '#fff8dc'],
                  gravity: 0.1,
                  scalar: 0.5 + Math.random() * 0.4,
                  zIndex: 9999,
                });
        
                if (Math.random() > 0.7) {
                  confetti({
                    particleCount: 6 + Math.random() * 4,
                    origin: { x: Math.random(), y: 0 },
                    colors: ['#ffd700', '#ffae00', '#ff4500'],
                    gravity: 0.2,
                    scalar: 0.8 + Math.random() * 0.4,
                    zIndex: 9999,
                  });
                }
              }, 150);
            }
          });
        } else {
          
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
        this.handleLoginError(err);
      }
    });
  }
  private handleLoginError(err: any) {
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
        this.showContactUs = true; 
        Swal.fire({
          icon: 'warning',
          title: 'Subscription Expired',
          text: err.error.message,
          background: '#1a1a1a',
          color: '#eaeaea',
          confirmButtonColor: '#ff9900'
        });
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
