import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // adjust the path
import Swal from 'sweetalert2';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { filter, map } from 'rxjs/operators';
import { GymService } from '../../services/gym.service';
import { SidebarService } from '../../services/sidebar.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  animations: [
    trigger('popupAnimation', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(-10px)',
        display: 'none'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)',
        display: 'block'
      })),
      transition('hidden => visible', [
        style({ display: 'block' }),
        animate('200ms ease-in')
      ]),
      transition('visible => hidden', [
        animate('200ms ease-out', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ]),
    ]),
  ]
})

export class HeaderComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<void>();

  headerTitle = localStorage.getItem('role')?.toLowerCase() === 'superadmin' ? 'Dashboard' : 'Members';

  
  popupVisible = false;

  upiId = 'lakshmikanthan.b.2001-1@okhdfcbank';


  paymentReceived: boolean = false; // Track if payment is done
  @ViewChild('logoutItem') logoutItem!: ElementRef;
  userrole: any;
  username: any;
  sidebarOpen: boolean = false;           // Track sidebar state
  isMobileView: boolean = false;          // Track mobile viewport
  subscriptionExpiring: boolean = false;
  validUntil: Date | null = null; // ✅ live expiry from service
  currentUserRoleId!: string | null;
  currentUserName!: string | null;
  subscriptionPlans = [
    {
      name: 'Basic',
      description: '🚀 Perfect for individuals starting out!',
      monthly: 7999, // Monthly rate
      quarterly: Math.round(5000 * 3 * 0.9), // 10% discount for 3 months
      yearly: Math.round(5000 * 12 * 0.8),  // 20% discount for 12 months
      highlight: false,
      features: [
        '✔ Access to Members Management',
        '✔ Easy Data Export',
        '✔ Manage Plans effortlessly',
        '✔ Hassle-free Subscription Control'
      ]
    },
    {
      name: 'Best Choice',
      description: '🎓 Best choice for growing gyms!',
      monthly: 10000, // Monthly rate
      quarterly: Math.round(10000 * 3 * 0.9), // 10% discount for 3 months
      yearly: Math.round(10000 * 12 * 0.8),   // 20% discount for 12 months
      highlight: true,
      features: [
        '✔ Smart Dashboard Overview',
        '✔ Full Members Management',
        '✔ Quick Data Export & Customized plans',
        '✔ Manual Attendance Tracking for flexibility',
        '✔ QR Attendance Tracking for speed & accuracy',
        '✔ Integrated Payments proof storage',
        '✔ Full Subscription Control'
      ]
    },
    {
      name: 'Premium',
      description: '👑 All-in-one power for professional gyms!',
      monthly: 13000, // Monthly rate
      quarterly: Math.round(15000 * 3 * 0.9), // 10% discount for 3 months
      yearly: Math.round(15000 * 12 * 0.8),   // 20% discount for 12 months
      highlight: false,
      features: [
        '✔ Smart Dashboard Overview',
        '✔ Complete Members Management',
        '✔ Integrated Payments proof storage',
        '✔ Easy Data Export & Customized plans',
        '✔ Manual Attendance Tracking for flexibility',
        '✔ QR Attendance Tracking for speed & accuracy',
        '✔ Flexible Manual Attendance Tracking',
        '✔ Ultimate Control & Flexibility',
        '✔ Priority Support & Customized Branding'
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
  constructor(private router: Router, private activatedRoute: ActivatedRoute,private sidebarService: SidebarService,private authService: AuthService,private gymService: GymService,private paymentService: PaymentService) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route.snapshot.data['title'] || 'Dashboard';
        })
      )
      .subscribe((title: string) => {
        this.headerTitle = title;
      });
     
  }

  ngOnInit() {
    this.authService.role$.subscribe(role => {
      this.userrole = role;
    });
    
    this.authService.username$.subscribe(username => {
      this.username = username;
    });
 // Subscribe to sidebar open state
 this.sidebarService.sidebarOpen$.subscribe(state => {
  this.sidebarOpen = state;
});
     // Listen for subscription updates
  this.authService.validUntil$.subscribe(validUntil => {
    if (validUntil) {
      this.validUntil = new Date(validUntil);
      this.checkSubscriptionExpiry();
    }
  });
  this.currentUserRoleId = localStorage.getItem('RoleId');
  this.updateMobileView();
    this.checkSubscriptionExpiry();

    this.scheduleSubscriptionPopup();
  }

    // Track window resize
    @HostListener('window:resize')
    updateMobileView() {
      this.isMobileView = window.innerWidth <= 991; // show hamburger for 991px and below
    }
    

  
  togglePopup() {
    this.popupVisible = !this.popupVisible;

    if (this.popupVisible) {
      setTimeout(() => {
        this.logoutItem?.nativeElement.focus();
      }, 0);
    }
  }
  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }
  scheduleSubscriptionPopup() {
    const validUntilStr = this.validUntil;
    if (!validUntilStr) return;
  
    const expiryDate = new Date(validUntilStr);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    if (diffMs <= 0) return; // already expired
  
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
    // ✅ Daily reminders (once per day if within 7 days)
    const todayKey = `subscriptionShown_${now.toDateString()}`;
    if (!localStorage.getItem(todayKey) && diffDays <= 7) {
      this.showSubscriptionPopup();
      localStorage.setItem(todayKey, "true");
    }
  
    // ✅ Timed triggers (10 min, 5 min, 1 min, 10 sec)
    if (diffDays <= 1) {
      const triggers = [
        { ms: 10 * 60 * 1000, type: "toast10" }, // 10 min
        { ms: 5 * 60 * 1000, type: "toast5" },   // 5 min
        { ms: 1 * 60 * 1000, type: "popup1" },   // 1 min
        { ms: 10 * 1000, type: "popup10" }       // 10 sec
      ];
  
      triggers.forEach(trigger => {
        const triggerTime = expiryDate.getTime() - trigger.ms;
        const delay = triggerTime - now.getTime();
  
        if (delay > 0) {
          setTimeout(() => {
            if (trigger.type === "toast10") {
              this.showToast("⏳ Subscription expiring in 10 minutes!", "info");
            } 
            else if (trigger.type === "toast5") {
              this.showToast("⚠️ Last 5 minutes! Please save your work.", "warning");
            } 
            else if (trigger.type === "popup1") {
              this.showSubscriptionPopup(); // normal popup with OK
            } 
            else if (trigger.type === "popup10") {
              this.showForcePopup(); // last 10 sec unclosable
            }
          }, delay);
        }
      });
    }
  }
  
  showToast(message: string, icon: "info" | "warning") {
    Swal.fire({
      toast: true,
      position: 'top-end',   // 👉 right-top corner
      icon: icon,
      title: message,
      showConfirmButton: false,
      timer: 5000,
      background: "#1f1f1f",
      color: "#f0f0f0"
    });
  }
  
  
  showForcePopup() {
    const validUntilStr = this.validUntil;
    if (!validUntilStr) return;
  
    const expiryDate = new Date(validUntilStr);
    let countdownInterval: any;
  
    Swal.fire({
      title: '<strong style="color:#ff0000;">⏳ Subscription Expiring!</strong>',
      html: `
        <h2 style="color:#fff;font-size:32px;" id="final-countdown">10s</h2>
        <p id="renew-text" 
           style="color:#0d6efd; font-size:18px; margin-top:10px;
                  opacity:0; transform:translateY(10px);
                  transition: all 1s ease;">
           Renew the Subscription
        </p>
      `,
      background: '#1f1f1f',
      color: '#fff',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false, // no default confirm
      didOpen: () => {
        const el = document.getElementById("final-countdown");
        const renewText = document.getElementById("renew-text");
  
        // Gentle fade-in for text
        if (renewText) {
          setTimeout(() => {
            renewText.style.opacity = "1";
            renewText.style.transform = "translateY(0)";
          }, 500);
        }
  
        countdownInterval = setInterval(() => {
          const now = new Date().getTime();
          let timeLeft = Math.ceil((expiryDate.getTime() - now) / 1000);
  
          if (timeLeft < 0) timeLeft = 0;
          if (el) el.innerText = timeLeft + "s";
  
          if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            Swal.close(); // just close popup
          }
        }, 1000);
      },
      willClose: () => {
        if (countdownInterval) clearInterval(countdownInterval);
      }
    });
  }
  

  
  
  checkSubscriptionExpiry() {
    const validUntilStr = this.validUntil;
    if (validUntilStr) {
      const today = new Date();
      const expiryDate = new Date(validUntilStr);
  
      const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
      this.subscriptionExpiring = diffDays <= 7 && diffDays >= 0;
    }
  }
  async showSubscriptionPopup() {
    const validUntilStr = this.validUntil;
    if (!validUntilStr) return;
  
    const expiryDate = new Date(validUntilStr);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    if (diffMs <= 0) return; // already expired
  
    const formattedDateTime = expiryDate.toLocaleString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  
    let countdownInterval: any;
  
    const { isConfirmed } = await Swal.fire({
      title: '<strong style="color:#ffcc00;">⚠ Subscription Expiry</strong>',
      html: `
        <div style="font-size:16px; color:#f0f0f0; font-family:'Segoe UI', Tahoma, sans-serif; text-align:left;">
          <p>Your subscription is going to expire soon.</p>
          <p><strong>Expiry Date & Time:</strong> ${formattedDateTime}</p>
          <p><strong>⏳ Time Remaining:</strong> 
            <span id="countdown-timer" 
                  style="font-size:22px; font-weight:bold; color:#00ff99;">
              calculating...
            </span>
          </p>
        </div>
      `,
      background: '#1f1f1f',
      color: '#f0f0f0',
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Renew Now',
      confirmButtonColor: '#0d6efd',
      focusConfirm: false,
      customClass: {
        popup: 'dark-popup',
        title: 'dark-title',
        confirmButton: 'dark-confirm'
      },
      didOpen: () => {
        const countdownEl = document.getElementById('countdown-timer');
  
        countdownInterval = setInterval(() => {
          const now = new Date().getTime();
          const distance = expiryDate.getTime() - now;
  
          if (distance <= 0) {
            countdownEl!.innerHTML = "<span style='color:#ff4444'>Expired</span>";
            clearInterval(countdownInterval);
            return;
          }
  
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
          // Highlight urgency colors
          let color = "#00ff99"; // green
          if (distance <= 5 * 60 * 1000) color = "#ff4444"; // red if < 5 min
          else if (distance <= 60 * 60 * 1000) color = "#ffcc00"; // yellow if < 1 hr
  
          countdownEl!.innerHTML = 
            `<span style="color:${color}">${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m ${seconds}s</span>`;
        }, 1000);
      },
      willClose: () => {
        if (countdownInterval) clearInterval(countdownInterval);
      }
    });
  
    if (isConfirmed) {
      this.showPaymentPopup();
    }
  }
  
  
  
  async showPaymentPopup() {
    const zyct = 'Zyct';
    const gymName = localStorage.getItem('GymName') || 'Gym';
    const validUntilStr = localStorage.getItem('validUntil');
    const expiryDate = validUntilStr ? new Date(validUntilStr) : null;
    const emailAddress = 'zyct.official@gmail.com';
    const roleId = this.currentUserRoleId; // logged-in user's RoleId
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


<p id="countdown" style="font-size:14px; color:#ffcc00; margin-top:8px; font-weight:bold;">
  ${expiryDate ? 'Time left: calculating...' : ''}
</p>

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
        // Handle card click
planCards.forEach(card => {
  card.addEventListener('click', () => {
    const name = card.getAttribute('data-name');
    const monthly = Number(card.getAttribute('data-monthly'));
    const quarterly = Number(card.getAttribute('data-quarterly'));
    const yearly = Number(card.getAttribute('data-yearly'));

    if (!name) return; // safety check

    // Highlight selected card
    planCards.forEach(c => (c as HTMLElement).style.borderColor = '#333');
    (card as HTMLElement).style.borderColor = '#ffcc00';

    // Populate dropdown with rates and discount info
    selectEl.innerHTML = `
      <option value="${monthly}" data-type="monthly" data-name="${name}">₹${monthly.toLocaleString()} / Month</option>
      <option value="${quarterly}" data-type="quarterly" data-name="${name}">₹${quarterly.toLocaleString()} / 3 Months (10% off)</option>
      <option value="${yearly}" data-type="yearly" data-name="${name}">₹${yearly.toLocaleString()} / Year (20% off)</option>
    `;

    // Update filtered menus based on selected plan
    const allowedMenus = this.planAccessPoints[name as keyof typeof this.planAccessPoints] || [];
    this.filteredMenus = this.availableMenus.filter(menu => allowedMenus.includes(menu.label));

    console.log(`Menus for ${name}:`, this.filteredMenus); // Optional: bind to UI
  });
});

    
        // ✅ Pay Now → Razorpay
        payBtn.addEventListener('click', () => {
          const amount = Number(selectEl.value);
          const planName = selectEl.selectedOptions[0]?.getAttribute('data-name') || 'Plan';
          const durationType = selectEl.selectedOptions[0].getAttribute('data-type') || 'monthly';
          const durationText = durationType === 'monthly' ? 'Month' :
                               durationType === 'quarterly' ? '3 Months' :
                               'Year';
         
    
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
                      this.generateReceipt(updatedRole, amount, response, planName).then(() => {
                        window.location.reload();
                      });

                     // ✅ New: update privileges dynamically
                      if (updatedRole.Privileges) {
                        this.authService.setPrivileges(updatedRole.Privileges);
                      }

                    });
                  } else {
                    Swal.fire({ icon: 'error', title: 'Payment Verification Failed!' });
                  }
                });
              },
              prefill: { name: this.currentUserName },
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

  // async showPaymentPopup() {
  //   const zyct = 'Zyct';
  //   const gymName = localStorage.getItem('GymName') || 'Gym';
  //   const validUntilStr = localStorage.getItem('validUntil');
  //   const expiryDate = validUntilStr ? new Date(validUntilStr) : null;
  //   const emailAddress = 'zyct.official@gmail.com';
  
  //   let selectedPlan = this.subscriptionPlans[0];
  
  //   await Swal.fire({
  //     title: '<strong style="color:#ffcc00;">Renew Subscription</strong>',
  //     html: `
  //       <div style="color:#f0f0f0; font-family:'Segoe UI', Tahoma, sans-serif; text-align:left;">
  //         <label for="planSelect">Select Plan:</label>
  //         <select id="planSelect" style="margin-top:5px; padding:5px; width:100%; border-radius:6px;">
  //           ${this.subscriptionPlans.map(p => `<option value="${p.amount}" data-name="${p.name}">${p.name} - ₹${p.amount}</option>`).join('')}
  //         </select>
  
  //         <div style="margin-top:15px; text-align:center;">
  //           <button id="payBtn" style="padding:8px 15px; background:#ffcc00; color:#000; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
  //             Pay Now
  //           </button>
  //         </div>
  
  //         <div id="emailNote" style="margin-top:15px; text-align:center; cursor:pointer;" title="Click here to send payment email">
  //           <p id="emailId" style="color:#f0f0f0; text-decoration:underline; font-weight:500; margin:0;">
  //             ${emailAddress.replace('@', '&#64;')}
  //           </p>
  //           <p style="font-size:12px; color:#cccccc; margin-top:5px;">
  //             Note: Please refresh the screen or Logout and login once again if the subscritption is not reflected <span style="color:#ffcc00; font-weight:bold;"></span>, 
  //           </p>
  //           <p id="countdown" style="font-size:14px; color:#ffcc00; margin-top:8px; font-weight:bold;">
  //             ${expiryDate ? 'Time left: calculating...' : ''}
  //           </p>
  //         </div>
  //       </div>
  //     `,
  //     showCloseButton: true,
  //     showConfirmButton: false,
  //     background: '#1f1f1f',
  //     color: '#f0f0f0',
  //     didOpen: () => {
  //       const selectEl = document.getElementById('planSelect') as HTMLSelectElement;
  //       const payBtn = document.getElementById('payBtn') as HTMLButtonElement;
  //       const countdownEl = document.getElementById('countdown') as HTMLElement;
  //       const emailNote = document.getElementById('emailNote') as HTMLElement;
  
  //       // ✅ Pay Now button → Razorpay
  //       payBtn.addEventListener('click', () => {
  //         const amount = Number(selectEl.value);
  //         const planName = selectEl.selectedOptions[0].getAttribute('data-name') || 'Plan';
  //         const roleId = this.currentUserRoleId; // logged-in user's RoleId
        
  //         this.paymentService.createOrder(amount).subscribe((order: any) => {
  //           const options = {
  //             key: 'rzp_live_RIIy4KDqcIQPqh', // Razorpay Key ID (frontend only)
  //             amount: order.amount, // in paise
  //             currency: order.currency,
  //             name: 'Zyct',
  //             description: `Subscription: ${planName}`,
  //             order_id: order.orderId,
  //             handler: (response: any) => {
  //               // Verify payment via backend
  //               this.paymentService.verifyPayment({
  //                 RazorpayOrderId: response.razorpay_order_id,
  //                 RazorpayPaymentId: response.razorpay_payment_id,
  //                 RazorpaySignature: response.razorpay_signature,
  //                 RoleId: Number(roleId),
  //                 Amount: amount,
  //                 PlanName: planName
  //               }).subscribe((res: any) => {
  //                 if (res.success) {
  //                   const updatedRole = res.role;
                
  //                   Swal.fire({
  //                     icon: 'success',
  //                     title: 'Payment Successful! Subscription updated 🎉',
  //                     confirmButtonText: 'OK'
  //                   }).then(() => {
  //                     // ✅ Update subscription data in localStorage & BehaviorSubjects
  //                     if (updatedRole.ValidUntil) {
  //                       localStorage.setItem('validUntil', updatedRole.ValidUntil);
  //                       this.authService['validUntilSubject'].next(updatedRole.ValidUntil);
  //                     }
                
  //                     if (updatedRole.PaidDate) {
  //                       localStorage.setItem('startDate', updatedRole.PaidDate);
  //                       this.authService['PaidDateSubject'].next(updatedRole.PaidDate);
  //                     }
                
  //                     localStorage.setItem('isActive', updatedRole.IsActive ? 'true' : 'false');
  //                     this.authService['isActiveSubject'].next(updatedRole.IsActive);
  //                     this.generateReceipt(updatedRole, amount, response, planName).then(() => {
  //                       window.location.reload();
  //                     });
                      

                     
  //                   });
                   

  //                 } else {
  //                   Swal.fire({
  //                     icon: 'error',
  //                     title: 'Payment Verification Failed!'
  //                   });
  //                 }
  //               });
                
  //             },
  //             prefill: { name: this.currentUserName }, // Only name
  //             theme: { color: '#ffcc00' }
  //           };
        
  //           const rzp = new (window as any).Razorpay(options);
  //           rzp.open();
  //         });
  //       });
        
        
  
  //       // Email fallback
  //       const openEmail = (planName: string, amount: number) => {
  //         const subject = encodeURIComponent(`Subscription Renew - ${gymName}`);
  //         const body = encodeURIComponent(`Gym: ${gymName}\nPlan: ${planName}\nAmount: ₹${amount}\nPlease attach the paid screenshot.`);
  //         const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  //         if (isMobile) {
  //           const gmailAppUrl = `googlegmail://co?to=${emailAddress}&subject=${subject}&body=${body}`;
  //           const mailtoUrl = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
  //           window.location.href = gmailAppUrl;
  //           setTimeout(() => window.location.href = mailtoUrl, 500);
  //         } else {
  //           const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddress}&su=${subject}&body=${body}`;
  //           window.open(gmailWebUrl, '_blank');
  //         }
  //       };
  
  //       emailNote.addEventListener('click', () => {
  //         const amount = Number(selectEl.value);
  //         const planName = selectEl.selectedOptions[0].getAttribute('data-name') || 'Plan';
  //         openEmail(planName, amount);
  //       });
  
  //       // Countdown timer
  //       if (expiryDate) {
  //         const interval = setInterval(() => {
  //           const now = new Date().getTime();
  //           const distance = expiryDate.getTime() - now;
  
  //           if (distance <= 0) {
  //             countdownEl.innerHTML = '<strong>Subscription expired!</strong>';
  //             clearInterval(interval);
  //             return;
  //           }
  
  //           const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  //           const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  //           const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  //           const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
  //           countdownEl.innerHTML = `<strong>Time left:</strong> ${days}d ${hours}h ${minutes}m ${seconds}s`;
  //         }, 1000);
  //       }
  //     }
  //   });
    
  // }
  
 // QR generation helper
async generateUpiQr(amount: string) {
  const note = "Payment for Zyct"; // ✅ your note/message
  const upiString = `upi://pay?pa=${this.upiId}&pn=Zyct&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

  try {
    return await QRCode.toDataURL(upiString, { width: 300 });
  } catch (err) {
    console.error(err);
    return '';
  }
}
generateReceipt(updatedRole: any, amount: number, response: any, planName: string): Promise<void> {
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
      addRow('Plan Name', planName);
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
  
  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout!',
      cancelButtonText: 'Cancel',
      background: '#1e1e1e', // dark background
      color: '#ffffff',       // white text
      customClass: {
        popup: 'dark-popup',
        title: 'dark-title',
        confirmButton: 'dark-confirm',
        cancelButton: 'dark-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('role');
        this.gymService.logout();
        Swal.fire({
          title: 'Logged Out',
          text: 'You have successfully logged out.',
          icon: 'success',
          background: '#1e1e1e',   // Dark popup background
          color: '#ffffff',        // White text
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          backdrop: `
            rgba(0, 0, 0, 0.95)   /* Black overlay background */
          `,
          customClass: {
            popup: 'dark-popup'    // For extra styling if needed
          }
        }).then(() => {
          this.router.navigate(['/login']);
        });
      }
    });
  }
  

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent) {
    if (event.altKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      this.togglePopup();
    }

    if (event.key === 'ArrowDown' && this.popupVisible) {
      event.preventDefault();
      // Wait for the element to be rendered and focusable
      setTimeout(() => this.logoutItem?.nativeElement.focus());
    }
    
    if (
      event.key === 'Enter' &&
      this.popupVisible &&
      document.activeElement === this.logoutItem?.nativeElement
    ) {
      event.preventDefault();
      this.logout();
    }
    
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.position-relative')) {
      this.popupVisible = false;
    }
  }
}
