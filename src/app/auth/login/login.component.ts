import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Adjust path if needed
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
import { PaymentService } from '../../services/payment.service';
import jsPDF from 'jspdf';
import { MemberService } from '../../services/member.service';
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


  subscriptionPlans = [
    {
      name: 'Basic',
      description: '🚀 Ideal for small gyms and beginners starting their journey.',
      monthly: 7999,
      quarterly: Math.round(7999 * 3 * 0.9), // 10% discount
      yearly: Math.round(7999 * 12 * 0.8),   // 20% discount
      highlight: false,
      features: [
        '✔ Manage members with ease',
        '✔ Quick data export',
        '✔ Create and manage plans effortlessly',
        '✔ Hassle-free subscription control'
      ]
    },
    {
      name: 'Advanced',
      description: '🌟 Perfect for growing gyms – unlock full potential!',
      monthly: 10000,
      quarterly: Math.round(10000 * 3 * 0.9), // 10% discount
      yearly: Math.round(10000 * 12 * 0.8),   // 20% discount
      highlight: true, // will show as the recommended plan
      features: [
        '✔ Smart and customizable dashboard for insights',
        '✔ Full members management with ease',
        '✔ Create personalized plans for each member',
        '✔ Export reports instantly',
        '✔ Manual attendance tracking for flexibility',
        '✔ QR code attendance tracking for speed & accuracy',
        '✔ Complete subscription control',
        '✔ Priority notifications & reminders',
        '✔ Payment Reminder sms , calls To Members'
      ]
    },
    {
      name: 'Premium',
      description: '👑 All-in-one solution for professional gyms',
      monthly: 13000,
      quarterly: Math.round(13000 * 3 * 0.9), // 10% discount
      yearly: Math.round(13000 * 12 * 0.8),   // 20% discount
      highlight: false,
      features: [
        '✔ Advanced dashboard with analytics & insights',
        '✔ Complete members management',
        '✔ Integrated payment proof storage',
        '✔ Easy data export & customized plans',
        '✔ Flexible manual attendance tracking',
        '✔ QR code attendance for speed & accuracy',
        '✔ Total control & operational flexibility',
        '✔ Priority support via Whatsapp',
        '✔ Payment Reminder sms , calls and emails To Members'
      ]
    }
  ];
  
  
  

  // Define all available menus
availableMenus = [
  { label: 'Dashboard', value: 'dashboard' },
  { label: 'Members', value: 'members' },
  { label: 'Plans', value: 'plans' },
  { label: 'Payments', value: 'payments' },
  { label: 'Subscription', value: 'subscription' },
  { label: 'Admin Onboard', value: 'admin-onboard' },
  { label: 'Export Data', value: 'export' },
  { label: 'Qr Attendance Tracking', value: 'Qr Attendance-Tracking' },
  { label: 'Manual Attendance Tracking', value: 'manual Attendance-Tracking' }
];

// Map menus by subscription plan
planAccessPoints = {
  Basic: [
    'Members',
    'Export Data',
    'Plans',
    'Subscription'
  ],
  Advanced: [
    'Dashboard',
    'Members',
    'Export Data',
    'Manual Attendance Tracking',
    'Qr Attendance Tracking',
    'Plans',
    'Subscription',
  ],
  Premium: [
    'Dashboard',
    'Members',
    'Plans',
    'Payments',
    'Subscription',
    'Export Data',
    'Qr Attendance Tracking',
    'Manual Attendance Tracking'
  ]
};
filteredMenus: { label: string; value: string }[] = []; // ✅ add this
  
  roleid: any;
  usernameemail: any;
  constructor(private router: Router, private authService: AuthService,private paymentService: PaymentService,private memberService: MemberService) {}

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
  getUserDetailByEmail() {
    this.memberService.getRolesByEmail(this.UserEmail).subscribe(roles => {
      if (roles && roles.length > 0) {
        this.roleid = roles[0].RoleId; // ⚡ Make sure to use correct property name from backend
        this.usernameemail = roles[0].UserName
        console.log("id",this.roleid ,"usernameemail", this.usernameemail)
      } else {
        this.roleid = null; // or handle "not found"
        this.usernameemail = null;
      }
    }, error => {
      console.error('Error fetching role by email:', error);
      this.roleid = null;
    });
    this.renewSubscription();
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
          confirmButtonColor: '#ff9900',
          confirmButtonText: '<span style="color:#000;font-weight:bold;">Renew Now</span>',
          
        }).then((result) => {
          if (result.isConfirmed) {
            // ✅ Open renewSubscription modal
            this.getUserDetailByEmail();
          }
        });
      }
       else {
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
  async renewSubscription() {
    const zyct = 'Zyct';
    const gymName = localStorage.getItem('GymName') || 'Gym';
    const validUntilStr = localStorage.getItem('validUntil');
    const expiryDate = validUntilStr ? new Date(validUntilStr) : null;
    const emailAddress = 'zyct.official@gmail.com';
  
    let selectedPlan = this.subscriptionPlans[0];
  
    await Swal.fire({
      title: '<strong style="color:#ffcc00;">Renew Subscription</strong>',
  html: `
 

<!-- Pricing Cards -->
<div style="
display: flex;
justify-content: center;
gap: 20px;
flex-wrap: wrap;
margin: 0 auto;
max-width: 950px;  /* ensures background fits cards only */
  ">
  ${this.subscriptionPlans.map(p => `
  <div class="plan-card"
       data-name="${p.name}"
       data-monthly="${p.monthly}"
       data-quarterly="${p.quarterly}"
       data-yearly="${p.yearly}"
       style="
         flex:1 1 220px; 
         max-width:300px; 
         padding:25px; 
         border-radius:15px; 
         background: ${p.highlight ? 'linear-gradient(145deg, #2a2a2a, #3a3a3a)' : '#1f1f1f'}; 
         border:2px solid ${p.highlight ? '#ffcc00' : '#333'}; 
         cursor:pointer; 
         box-shadow:0 8px 18px rgba(0,0,0,0.6);
         text-align:center; 
         transition: transform 0.3s, box-shadow 0.3s;
         position: relative;
       "
       onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 12px 22px rgba(0,0,0,0.8)';"
       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 18px rgba(0,0,0,0.6)';"
  >
    <div class="badge-wrapper">
      ${p.highlight ? `<div style="position:absolute; top:15px; right:15px; background:#ffcc00; color:#1a1a1a; padding:5px 10px; font-size:12px; font-weight:bold; border-radius:6px;">POPULAR</div>` : ''}
      <div style="margin-top:30px;"> 
        <div style="font-weight:bold; font-size:20px; margin-bottom:12px; color:${p.highlight ? '#ffcc00' : '#fff'}">${p.name}</div>
        <div style="margin-bottom:12px; font-size:14px; color:#ccc;">${p.description || ''}</div>
        <ul style="margin:0; padding:0; list-style:none; font-size:13px; text-align:left;">
          ${p.features.map(f => `
            <li style="
              margin:5px 0; 
              color:${p.highlight ? '#fff' : '#bbb'}; 
              padding-left:16px; 
              text-indent:-16px;
            ">• ${f}</li>
          `).join('')}
        </ul>
      </div>
    </div>
  </div>
`).join('')}

  
</div>

<!-- Duration Selection -->
<label for="planSelect" style="display:block; margin-top:25px; margin-bottom:8px; font-weight:bold; color:#ccc;">Select Duration:</label>
<select id="planSelect" style="padding:10px; width:100%; max-width:300px; border-radius:8px; border:none; background:#2c2c2c; color:#fff;">
<option value="" disabled selected>Select a plan first</option>
</select>

<!-- Pay Button -->
<div style="margin-top:20px;">
<button id="payBtn" style="padding:12px 25px; background:#ffcc00; color:#1a1a1a; border:none; border-radius:8px; font-weight:bold; cursor:pointer; transition: transform 0.3s;"
  onmouseover="this.style.transform='scale(1.05)';"
  onmouseout="this.style.transform='scale(1)';">
  Pay Now
</button>
</div>

      

  `,
  showCloseButton: true,
  showConfirmButton: false,
  background: '#1f1f1f',
  color: '#f0f0f0',
  width: 'auto',   // 🔑 fits content (3 cards width)
      didOpen: () => {
        const planCards = Swal.getPopup()?.querySelectorAll('.plan-card') || [];
        const selectEl = document.getElementById('planSelect') as HTMLSelectElement;
        const payBtn = document.getElementById('payBtn') as HTMLButtonElement;
        const countdownEl = document.getElementById('countdown') as HTMLElement;
        const emailNote = document.getElementById('emailNote') as HTMLElement;
    
     // Handle card click
planCards.forEach(card => {
  card.addEventListener('click', () => {
    const name = card.getAttribute('data-name');
    const monthly = Number(card.getAttribute('data-monthly'));
    const quarterly = Number(card.getAttribute('data-quarterly'));
    const yearly = Number(card.getAttribute('data-yearly'));

    if (!name) return;

    // Reset borders
    planCards.forEach(c => (c as HTMLElement).style.borderColor = '#333');
    (card as HTMLElement).style.borderColor = '#ffcc00';

    // Populate dropdown
    selectEl.innerHTML = `
      <option value="${monthly}" data-type="monthly" data-name="${name}">₹${monthly.toLocaleString()} / Month</option>
      <option value="${quarterly}" data-type="quarterly" data-name="${name}">₹${quarterly.toLocaleString()} / 3 Months (10% off)</option>
      <option value="${yearly}" data-type="yearly" data-name="${name}">₹${yearly.toLocaleString()} / Year (20% off)</option>
    `;

    // ✅ Default to monthly (₹10000)
    selectEl.value = monthly.toString();

    // Update privileges
    const allowedMenus = this.planAccessPoints[name as keyof typeof this.planAccessPoints] || [];
    this.filteredMenus = this.availableMenus.filter(menu => allowedMenus.includes(menu.label));
  });
});

// ✅ Auto-select the highlight:true plan (Best Choice - 10000 monthly)
const highlightedPlan = this.subscriptionPlans.find(p => p.highlight);
if (highlightedPlan) {
  const highlightedCard = Array.from(planCards).find(
    c => c.getAttribute('data-name') === highlightedPlan.name
  );
  if (highlightedCard) {
    (highlightedCard as HTMLElement).click(); // simulate user click
  }
}

    
        // ✅ Pay Now → Razorpay
        payBtn.addEventListener('click', () => {
          const amount = Number(selectEl.value);
          const planName = selectEl.selectedOptions[0]?.getAttribute('data-name') || 'Plan';
          const durationType = selectEl.selectedOptions[0].getAttribute('data-type') || 'monthly';
          const durationText = durationType === 'monthly' ? 'Month' :
                               durationType === 'quarterly' ? '3 Months' :
                               'Year';
          const roleId = this.roleid;
    
          if (!amount) {
            Swal.showValidationMessage('Please select a plan duration.');
            return;
          }
    
          this.paymentService.createOrder(amount).subscribe((order: any) => {
            const options = {
              key: 'rzp_test_RIYosIVFWWyoSn',
              amount: order.amount,
              currency: order.currency,
              name: 'Zyct',
              description: `Subscription: ${planName}`,
              order_id: order.orderId,
              handler: (response: any) => {
                this.paymentService.verifyPayment({
                  RazorpayOrderId: response.razorpay_order_id,
                  RazorpayPaymentId: response.razorpay_payment_id,
                  RazorpaySignature: response.razorpay_signature,
                  RoleId: Number(roleId),
                  Amount: amount,
                  PlanName: durationText,
                  Privileges: this.filteredMenus.map(menu => menu.value) // <-- send only the 'value' to backend
                }).subscribe((res: any) => {
                  if (res.success) {
                    const updatedRole = res.role;
                    Swal.fire({
                      icon: 'success',
                      title: 'Payment Successful! Subscription updated 🎉',
                      confirmButtonText: 'OK'
                    }).then(() => {
                      if (updatedRole.ValidUntil) {
                        localStorage.setItem('validUntil', updatedRole.ValidUntil);
                        this.authService['validUntilSubject'].next(updatedRole.ValidUntil);
                      }
                      if (updatedRole.PaidDate) {
                        localStorage.setItem('startDate', updatedRole.PaidDate);
                        this.authService['PaidDateSubject'].next(updatedRole.PaidDate);
                      }
                      localStorage.setItem('isActive', updatedRole.IsActive ? 'true' : 'false');
                      this.authService['isActiveSubject'].next(updatedRole.IsActive);
                      this.generateReceipt(updatedRole, amount, response, planName, durationText);
                    });
                  } else {
                    Swal.fire({ icon: 'error', title: 'Payment Verification Failed!' });
                  }
                });
              },
              prefill: { name: this.usernameemail },
              theme: { color: '#ffcc00' }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
          });
        });
    
        // ✅ Email fallback
        const openEmail = (planName: string, amount: number) => {
          const subject = encodeURIComponent(`Subscription Renew - ${gymName}`);
          const body = encodeURIComponent(`Gym: ${gymName}\nPlan: ${planName}\nAmount: ₹${amount}\nPlease attach the paid screenshot.`);
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          if (isMobile) {
            window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
          } else {
            window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddress}&su=${subject}&body=${body}`, '_blank');
          }
        };
        emailNote.addEventListener('click', () => {
          const amount = Number(selectEl.value);
          const planName = selectEl.selectedOptions[0]?.getAttribute('data-name') || 'Plan';
          openEmail(planName, amount);
        });
    
        // ✅ Countdown timer
        if (expiryDate) {
          const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = expiryDate.getTime() - now;
            if (distance <= 0) {
              countdownEl.innerHTML = '<strong>Subscription expired!</strong>';
              clearInterval(interval);
              return;
            }
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            countdownEl.innerHTML = `<strong>Time left:</strong> ${days}d ${hours}h ${minutes}m ${seconds}s`;
          }, 1000);
        }
      }
    });
    
    
  }
  generateReceipt(updatedRole: any, amount: number, response: any, planName: string,  planType: string): Promise<void>
 {
    return new Promise((resolve) => {
      const doc = new jsPDF();
  
      // Helper: Format date
      const formatDate = (dateString: string): string => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return (
          date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }) +
          ', ' +
          date.toLocaleTimeString('en-GB')
        );
      };
  
      // Background
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
  
      // White receipt card
      const margin = 15;
      const cardWidth = doc.internal.pageSize.width - margin * 2;
      const cardHeight = doc.internal.pageSize.height - margin * 2;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, margin, cardWidth, cardHeight, 5, 5, 'F');
  
      // Logo + Company name
      const img = new Image();
      img.src = 'assets/images/favicon.png';
  
      img.onload = () => {
        doc.addImage(img, 'PNG', 25, 20, 20, 20);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text('Zyct - Payment Receipt', 105, 30, { align: 'center' });
  
        // Green check circle
        doc.setFillColor(46, 204, 113);
        doc.circle(105, 50, 10, 'F');
  
        // Draw white tick
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(2);
        doc.line(101, 50, 104, 55); // left arm
        doc.line(104, 55, 110, 46); // right arm
  
        // Payment Success
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Payment Success!', 105, 70, { align: 'center' });
  
        // Big amount
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`Rs. ${amount.toLocaleString()}`, 105, 80, { align: 'center' });
  
        // Receipt details
        const startY = 100;
        const leftX = 35;
        const rightX = 140;
        let y = startY;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
  
        const addRow = (label: string, value: string) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, leftX, y);
          doc.setFont('helvetica', 'normal');
          doc.text(value || '-', rightX, y);
          y += 10;
        };
  
        // Only required data
        addRow('Plan Name', `${planName} - ${planType}`);
        addRow('Amount Paid', `Rs. ${amount}`);
        addRow('Payment ID', response.razorpay_payment_id);
        addRow('Order ID', response.razorpay_order_id);
        addRow('Start Date', formatDate(updatedRole.PaidDate));
        addRow('Valid Until', formatDate(updatedRole.ValidUntil));
        addRow('Status', updatedRole.IsActive ? 'Active' : 'Inactive');
  
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text('Zyct © 2025. All Rights Reserved.', 105, doc.internal.pageSize.height - 25, { align: 'center' });
        doc.text('This is a system-generated receipt. For support, contact zyct.official@gmail.com', 105, doc.internal.pageSize.height - 18, { align: 'center' });
  
        // Save and resolve
        doc.save(`Receipt-${response.razorpay_payment_id}.pdf`);
        resolve();
      };
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
