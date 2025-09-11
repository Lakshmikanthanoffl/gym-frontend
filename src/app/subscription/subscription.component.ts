import { Component, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import QRCode from 'qrcode';
import { PaymentService } from '../services/payment.service';
@Component({
  selector: 'app-subscription',
  standalone: false,
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent implements OnInit, OnDestroy {
  progressPercent: number = 0;
isExpired: boolean = false;
  expiryDate!: Date;
  formattedExpiry!: string;
  countdown!: string;
  countdownColor: string = '#00ff99';
  private intervalId: any;
  subscriptionStatus: string = "Active";
statusClass: string = "active";
  upiId = 'lakshmikanthan.b.2001-1@okhdfcbank';

  subscriptionPlans = [
    { name: 'Monthly', amount: 3499 },
    { name: '3 Months', amount: 9999 },
    { name: 'Yearly', amount: 38000 }
  ];
  isBlinking!: boolean;
  constructor(private paymentService: PaymentService) { }
  ngOnInit(): void {
    const validUntilStr = localStorage.getItem('validUntil');
    if (!validUntilStr) return;

    this.expiryDate = new Date(validUntilStr);

    this.formattedExpiry = this.expiryDate.toLocaleString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    this.startCountdown();
  }

  startCountdown() {
    this.updateCountdown();

    this.intervalId = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }
  updateStatus() {
    const now = new Date();
    const expiry = new Date(this.expiryDate);
    const diff = expiry.getTime() - now.getTime();
    const daysLeft = diff / (1000 * 60 * 60 * 24);
  
    if (diff <= 0) {
      // ❌ Already expired
      this.subscriptionStatus = "Expired";
      this.statusClass = "expired";
      this.countdownColor = "#888888"; // gray
      this.isBlinking = false;
  
    } else if (
      expiry.getDate() === now.getDate() &&
      expiry.getMonth() === now.getMonth() &&
      expiry.getFullYear() === now.getFullYear()
    ) {
      // 📅 Expires today
      this.subscriptionStatus = "Expires Today";
      this.statusClass = "expires-today";
      this.countdownColor = "#ff4444"; // red
      this.isBlinking = false;
  
    } else if (daysLeft <= 7) {
      // ⚠️ Within 7 days (but not today)
      this.subscriptionStatus = "Expiring Soon";
      this.statusClass = "expiring-soon";
      this.countdownColor = "#ffcc00"; // yellow
      this.isBlinking = false;
  
    } else {
      // ✅ Safe
      this.subscriptionStatus = "Active";
      this.statusClass = "active";
      this.countdownColor = "#00ff99"; // green
      this.isBlinking = false;
    }
  
    // 🚨 Last 1 hour → blinking red (only if not expired)
    if (diff > 0 && diff <= 60 * 60 * 1000) {
      this.subscriptionStatus = "Expires Today";
      this.statusClass = "expires-today";
      this.countdownColor = "#ff4444"; 
      this.isBlinking = true;
    }
  }
  
  
  
  updateCountdown() {
    const now = new Date().getTime();
    const distance = this.expiryDate.getTime() - now;
  
    if (distance <= 0) {
      this.countdown = 'Expired';
      this.countdownColor = '#ff4444';
      this.isExpired = true;
      this.progressPercent = 0;
      clearInterval(this.intervalId);
      return;
    }
  
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
    // Countdown text
    this.countdown = `${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m ${seconds}s`;
  
    // Color logic
    if (distance <= 60 * 60 * 1000) {
      // 🚨 Last 1 hour → Blinking red
      this.countdownColor = '#ff4444';
      this.isBlinking = true;
    } else if (days === 0) {
      // 🔴 Expiry day
      this.countdownColor = '#ff4444';
      this.isBlinking = false;
    } else if (days <= 7) {
      // ⚠️ Within 7 days
      this.countdownColor = '#ffcc00';
      this.isBlinking = false;
    } else {
      // ✅ Safe (green)
      this.countdownColor = '#00ff99';
      this.isBlinking = false;
    }
  
    // Progress bar decreasing %
    const totalTime = this.expiryDate.getTime() - new Date(localStorage.getItem('startDate')!).getTime();
    this.progressPercent = (distance / totalTime) * 100;
    this.updateStatus();
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
        <div style="color:#f0f0f0; font-family:'Segoe UI', Tahoma, sans-serif; text-align:left;">
          <label for="planSelect">Select Plan:</label>
          <select id="planSelect" style="margin-top:5px; padding:5px; width:100%; border-radius:6px;">
            ${this.subscriptionPlans.map(p => `<option value="${p.amount}" data-name="${p.name}">${p.name} - ₹${p.amount}</option>`).join('')}
          </select>
  
          <div style="margin-top:15px; text-align:center;">
            <button id="payBtn" style="padding:8px 15px; background:#ffcc00; color:#000; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
              Pay Now
            </button>
          </div>
  
          <div id="emailNote" style="margin-top:15px; text-align:center; cursor:pointer;" title="Click here to send payment email">
            <p id="emailId" style="color:#f0f0f0; text-decoration:underline; font-weight:500; margin:0;">
              ${emailAddress.replace('@', '&#64;')}
            </p>
            <p style="font-size:12px; color:#cccccc; margin-top:5px;">
              Note: Please pay using <span style="color:#ffcc00; font-weight:bold;">GPay</span>, 
              <span style="color:#ffcc00; font-weight:bold;">PhonePe</span>, or 
              <span style="color:#ffcc00; font-weight:bold;">Paytm</span> and upload the paid screenshot to this mail.
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
        const payBtn = document.getElementById('payBtn') as HTMLButtonElement;
        const countdownEl = document.getElementById('countdown') as HTMLElement;
        const emailNote = document.getElementById('emailNote') as HTMLElement;
  
        // ✅ Pay Now button → Razorpay
        payBtn.addEventListener('click', () => {
          const amount = Number(selectEl.value);
          const planName = selectEl.selectedOptions[0].getAttribute('data-name') || 'Plan';
  
          this.paymentService.createOrder(amount).subscribe((order: any) => {
            const options = {
              key: 'rzp_test_RGGtv2W1TjYURz', // Only Key ID on frontend
              amount: order.amount, // in paise
              currency: order.currency,
              name: 'Zyct',
              description: `Subscription: ${planName}`,
              order_id: order.orderId,
              handler: (response: any) => {
                // Verify payment via backend
                this.paymentService.verifyPayment({
                  RazorpayOrderId: response.razorpay_order_id,
                  RazorpayPaymentId: response.razorpay_payment_id,
                  RazorpaySignature: response.razorpay_signature
                }).subscribe((res: any) => {
                  Swal.fire({
                    icon: res.success ? 'success' : 'error',
                    title: res.success ? 'Payment Successful!' : 'Payment Verification Failed!'
                  });
                });
              },
              prefill: { name: 'Customer Name', email: 'customer@example.com', contact: '9876543210' },
              theme: { color: '#ffcc00' }
            };
  
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
          });
        });
  
        // Email fallback
        const openEmail = (planName: string, amount: number) => {
          const subject = encodeURIComponent(`Subscription Renew - ${gymName}`);
          const body = encodeURIComponent(`Gym: ${gymName}\nPlan: ${planName}\nAmount: ₹${amount}\nPlease attach the paid screenshot.`);
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
  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
