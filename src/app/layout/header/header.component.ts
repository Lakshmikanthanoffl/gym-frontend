import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // adjust the path
import Swal from 'sweetalert2';
import QRCode from 'qrcode';

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

  headerTitle = 'Dashboard';
  
  popupVisible = false;

  upiId = 'lakshmikanthan.b.2001-1@okhdfcbank';

  subscriptionPlans = [
    { name: 'Monthly', amount: 3499 },
    { name: '3 Months', amount: 9999 },
    { name: 'Yearly', amount: 38000 }
  ];
  paymentReceived: boolean = false; // Track if payment is done
  @ViewChild('logoutItem') logoutItem!: ElementRef;
  userrole: any;
  username: any;
  sidebarOpen: boolean = false;           // Track sidebar state
  isMobileView: boolean = false;          // Track mobile viewport
  subscriptionExpiring: boolean = false;
  validUntil: Date | null = null; // ✅ live expiry from service
  constructor(private router: Router, private activatedRoute: ActivatedRoute,private sidebarService: SidebarService,private authService: AuthService,private gymService: GymService) {
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
  
    // Helper: generate properly encoded UPI deep link
    const generateUpiLink = (amount: number) =>
      `upi://pay?pa=${encodeURIComponent('lakshmikanthan.b.2001-1@okhdfcbank')}` +
      `&pn=${encodeURIComponent(zyct)}` +
      `&am=${encodeURIComponent(amount)}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent('Subscription Payment')}`;
  
    // Initial plan
    let selectedPlan = this.subscriptionPlans[0];
    let upiLink = generateUpiLink(selectedPlan.amount);
    let qrDataUrl = await this.generateUpiQr(upiLink);
  
    await Swal.fire({
      title: '<strong style="color:#ffcc00;">Renew Subscription</strong>',
      html: `
        <div style="color:#f0f0f0; font-family:'Segoe UI', Tahoma, sans-serif; text-align:left;">
          <label for="planSelect">Select Plan:</label>
          <select id="planSelect" style="margin-top:5px; padding:5px; width:100%; border-radius:6px;">
            ${this.subscriptionPlans.map(p => `<option value="${p.amount}" data-name="${p.name}">${p.name} - ₹${p.amount}</option>`).join('')}
          </select>
  
          <!-- QR wrapper centered using flex -->
          <div style="display: flex; justify-content: center; margin: 15px 0;">
            <div id="qrWrapper" style="position: relative; cursor: pointer;">
              <img id="upiQrImg" src="${qrDataUrl}" style="width:180px; height:180px; border-radius:6px; display:block;" />
              <div id="qrOverlay" style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffcc00;
                font-weight: bold;
                background: rgba(0,0,0,0.5);
                opacity: 0;
                transition: opacity 0.3s;
                border-radius: 6px;
                text-align: center;
              ">
                Tap / Scan to Pay
              </div>
            </div>
          </div>
          <p style="font-size:12px; color:#cccccc; margin-top:5px; text-align:center;">Tap the QR for UPI payment</p>
  
          <div id="emailNote" style="margin-top:10px; text-align:center; cursor:pointer;" title="Click here to send payment email">
            <p id="emailId" style="color:#f0f0f0; text-decoration:underline; font-weight:500; margin:0;">
              ${emailAddress.replace('@', '&#64;')}
            </p>
            <p style="font-size:12px; color:#cccccc; margin-top:5px;">
              Note: Please pay using <span style="color:#ffcc00; font-weight:bold;">GPay</span>, <span style="color:#ffcc00; font-weight:bold;">PhonePe</span>, or <span style="color:#ffcc00; font-weight:bold;">Paytm</span> and upload the paid screenshot to this mail.
            </p>
            <p style="font-size:12px; color:#cccccc; margin-top:2px;">
              It may take 5 to 10 minutes to reflect.
            </p>
            <p id="countdown" style="font-size:14px; color:#ffcc00; margin-top:8px; font-weight:bold;">
              ${expiryDate ? 'Time left: calculating...' : ''}
            </p>
          </div>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      background: '#1f1f1f',
      color: '#f0f0f0',
      didOpen: () => {
        const selectEl = document.getElementById('planSelect') as HTMLSelectElement;
        const qrImgEl = document.getElementById('upiQrImg') as HTMLImageElement;
        const qrWrapper = document.getElementById('qrWrapper') as HTMLElement;
        const qrOverlay = document.getElementById('qrOverlay') as HTMLElement;
        const countdownEl = document.getElementById('countdown') as HTMLElement;
        const emailNote = document.getElementById('emailNote') as HTMLElement;
  
        // Hover / tap overlay effect
        qrWrapper.addEventListener('mouseenter', () => qrOverlay.style.opacity = '1');
        qrWrapper.addEventListener('mouseleave', () => qrOverlay.style.opacity = '0');
        qrWrapper.addEventListener('touchstart', () => qrOverlay.style.opacity = '1');
        qrWrapper.addEventListener('touchend', () => qrOverlay.style.opacity = '0');
  
        // QR click: open UPI link on mobile with proper fallback
        qrWrapper.addEventListener('click', () => {
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
          if (isMobile) {
            let fallbackTimeout: any;
  
            const handleVisibilityChange = () => {
              if (document.hidden) {
                clearTimeout(fallbackTimeout);
              }
            };
            document.addEventListener('visibilitychange', handleVisibilityChange);
  
            // Open UPI app
            window.location.href = upiLink;
  
            // fallback after 1.5s if still on page
            fallbackTimeout = setTimeout(() => {
              Swal.fire({
                icon: 'info',
                title: 'Could not open UPI app',
                html: `Please scan the QR code or use this UPI link:<br><strong style="word-break:break-word;">${upiLink}</strong>`,
              });
              document.removeEventListener('visibilitychange', handleVisibilityChange);
            }, 1500);
          } else {
            // Desktop: show QR and link
            Swal.fire({
              icon: 'info',
              title: 'Scan QR to Pay',
              html: `<p>Scan this QR code using your UPI app to complete payment.</p>
                     <p style="word-break:break-word; color:#ffcc00;">${upiLink}</p>`,
              showCloseButton: true
            });
          }
        });
  
        // Handle email click
        const openEmail = (planName: string, amount: number) => {
          const subject = encodeURIComponent(`Subscription Renew - ${gymName}`);
          const body = encodeURIComponent(`Gym: ${gymName}\nPlan: ${planName}\nAmount: ₹${amount}\nPlease pay using GPay, PhonePe, or Paytm and attach the paid screenshot.`);
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
          if (isMobile) {
            const gmailAppUrl = `googlegmail://co?to=${emailAddress}&subject=${subject}&body=${body}`;
            const mailtoUrl = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
            window.location.href = gmailAppUrl;
            setTimeout(() => window.location.href = mailtoUrl, 500);
          } else {
            const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddress}&su=${subject}&body=${body}`;
            window.open(gmailWebUrl, '_blank');
          }
        };
  
        emailNote.addEventListener('click', () => {
          const amount = Number(selectEl.value);
          const planName = selectEl.selectedOptions[0].getAttribute('data-name') || 'Plan';
          openEmail(planName, amount);
        });
  
        // Update QR when plan changes
        selectEl.addEventListener('change', async (event: any) => {
          const amount = Number(event.target.value);
          const planName = selectEl.selectedOptions[0].getAttribute('data-name') || 'Plan';
          upiLink = generateUpiLink(amount);
          qrImgEl.src = await this.generateUpiQr(upiLink);
        });
  
        // Countdown timer
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
  async renewSubscription() {
    const zyct = 'Zyct';
    const gymName = localStorage.getItem('GymName') || 'Gym';
    const validUntilStr = localStorage.getItem('validUntil');
    const expiryDate = validUntilStr ? new Date(validUntilStr) : null;
    const emailAddress = 'zyct.official@gmail.com';
  
    // Helper: generate properly encoded UPI deep link
    const generateUpiLink = (amount: number) =>
      `upi://pay?pa=${encodeURIComponent('lakshmikanthan.b.2001-1@okhdfcbank')}` +
      `&pn=${encodeURIComponent(zyct)}` +
      `&am=${encodeURIComponent(amount)}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent('Subscription Payment')}`;
  
    // Initial plan
    let selectedPlan = this.subscriptionPlans[0];
    let upiLink = generateUpiLink(selectedPlan.amount);
    let qrDataUrl = await this.generateUpiQr(upiLink);
  
    await Swal.fire({
      title: '<strong style="color:#ffcc00;">Renew Subscription</strong>',
      html: `
        <div style="color:#f0f0f0; font-family:'Segoe UI', Tahoma, sans-serif; text-align:left;">
          <label for="planSelect">Select Plan:</label>
          <select id="planSelect" style="margin-top:5px; padding:5px; width:100%; border-radius:6px;">
            ${this.subscriptionPlans.map(p => `<option value="${p.amount}" data-name="${p.name}">${p.name} - ₹${p.amount}</option>`).join('')}
          </select>
  
          <!-- QR wrapper centered using flex -->
          <div style="display: flex; justify-content: center; margin: 15px 0;">
            <div id="qrWrapper" style="position: relative; cursor: pointer;">
              <img id="upiQrImg" src="${qrDataUrl}" style="width:180px; height:180px; border-radius:6px; display:block;" />
              <div id="qrOverlay" style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffcc00;
                font-weight: bold;
                background: rgba(0,0,0,0.5);
                opacity: 0;
                transition: opacity 0.3s;
                border-radius: 6px;
                text-align: center;
              ">
                Tap / Scan to Pay
              </div>
            </div>
          </div>
          <p style="font-size:12px; color:#cccccc; margin-top:5px; text-align:center;">Tap the QR for UPI payment</p>
  
          <div id="emailNote" style="margin-top:10px; text-align:center; cursor:pointer;" title="Click here to send payment email">
            <p id="emailId" style="color:#f0f0f0; text-decoration:underline; font-weight:500; margin:0;">
              ${emailAddress.replace('@', '&#64;')}
            </p>
            <p style="font-size:12px; color:#cccccc; margin-top:5px;">
              Note: Please pay using <span style="color:#ffcc00; font-weight:bold;">GPay</span>, <span style="color:#ffcc00; font-weight:bold;">PhonePe</span>, or <span style="color:#ffcc00; font-weight:bold;">Paytm</span> and upload the paid screenshot to this mail.
            </p>
            <p style="font-size:12px; color:#cccccc; margin-top:2px;">
              It may take 5 to 10 minutes to reflect.
            </p>
            <p id="countdown" style="font-size:14px; color:#ffcc00; margin-top:8px; font-weight:bold;">
              ${expiryDate ? 'Time left: calculating...' : ''}
            </p>
          </div>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      background: '#1f1f1f',
      color: '#f0f0f0',
      didOpen: () => {
        const selectEl = document.getElementById('planSelect') as HTMLSelectElement;
        const qrImgEl = document.getElementById('upiQrImg') as HTMLImageElement;
        const qrWrapper = document.getElementById('qrWrapper') as HTMLElement;
        const qrOverlay = document.getElementById('qrOverlay') as HTMLElement;
        const countdownEl = document.getElementById('countdown') as HTMLElement;
        const emailNote = document.getElementById('emailNote') as HTMLElement;
  
        // Hover / tap overlay effect
        qrWrapper.addEventListener('mouseenter', () => qrOverlay.style.opacity = '1');
        qrWrapper.addEventListener('mouseleave', () => qrOverlay.style.opacity = '0');
        qrWrapper.addEventListener('touchstart', () => qrOverlay.style.opacity = '1');
        qrWrapper.addEventListener('touchend', () => qrOverlay.style.opacity = '0');
  
        // QR click: mobile open deep link (GPay) or scan QR (others)
        qrWrapper.addEventListener('click', () => {
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
          if (isMobile) {
            const userAgent = navigator.userAgent;
  
            // Open deep link for GPay reliably
            if (/GPay/i.test(userAgent)) {
              window.location.href = upiLink;
            }
  
            // Always show QR for Paytm / PhonePe / others
            Swal.fire({
              icon: 'info',
              title: 'Scan QR to Pay',
              html: `<p>Scan this QR code using your UPI app to complete payment.</p>
                     <img src="${qrDataUrl}" style="width:180px;height:180px;border-radius:6px;margin-top:10px;" />
                     <p style="word-break:break-word; color:#ffcc00;">UPI link: ${upiLink}</p>`,
              showCloseButton: true
            });
          } else {
            // Desktop: show QR and UPI link
            Swal.fire({
              icon: 'info',
              title: 'Scan QR to Pay',
              html: `<p>Scan this QR code using your UPI app to complete payment.</p>
                     <img src="${qrDataUrl}" style="width:180px;height:180px;border-radius:6px;margin-top:10px;" />
                     <p style="word-break:break-word; color:#ffcc00;">UPI link: ${upiLink}</p>`,
              showCloseButton: true
            });
          }
        });
  
        // Handle email click
        const openEmail = (planName: string, amount: number) => {
          const subject = encodeURIComponent(`Subscription Renew - ${gymName}`);
          const body = encodeURIComponent(`Gym: ${gymName}\nPlan: ${planName}\nAmount: ₹${amount}\nPlease pay using GPay, PhonePe, or Paytm and attach the paid screenshot.`);
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
          if (isMobile) {
            const gmailAppUrl = `googlegmail://co?to=${emailAddress}&subject=${subject}&body=${body}`;
            const mailtoUrl = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
            window.location.href = gmailAppUrl;
            setTimeout(() => window.location.href = mailtoUrl, 500);
          } else {
            const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddress}&su=${subject}&body=${body}`;
            window.open(gmailWebUrl, '_blank');
          }
        };
  
        emailNote.addEventListener('click', () => {
          const amount = Number(selectEl.value);
          const planName = selectEl.selectedOptions[0].getAttribute('data-name') || 'Plan';
          openEmail(planName, amount);
        });
  
        // Update QR when plan changes
        selectEl.addEventListener('change', async (event: any) => {
          const amount = Number(event.target.value);
          const planName = selectEl.selectedOptions[0].getAttribute('data-name') || 'Plan';
          upiLink = generateUpiLink(amount);
          qrImgEl.src = await this.generateUpiQr(upiLink);
        });
  
        // Countdown timer
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
