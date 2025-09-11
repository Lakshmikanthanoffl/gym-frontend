import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { PaymentService } from '../services/payment.service';

@Component({
  selector: 'app-razorpay-demo',
  standalone: false,
  template: `<button (click)="openDemo()">Pay Demo Subscription</button>`,
  styles: [`
    button { 
      padding:10px 20px; 
      background:#ffcc00; 
      color:#000; 
      border:none; 
      border-radius:6px; 
      cursor:pointer; 
      font-weight:bold; 
    }
  `]
})
export class RazorpayDemoComponent implements OnInit {

  subscriptionPlans = [
    { name: 'Basic', amount: 100 },
    { name: 'Standard', amount: 200 },
    { name: 'Premium', amount: 300 }
  ];

  emailAddress = 'zyct.official@gmail.com';
  expiryDate: Date | null = null;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    // Optional: set a demo expiry date 1 day from now
    this.expiryDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  }

  async openDemo() {
    let selectedPlan = this.subscriptionPlans[0];

    await Swal.fire({
      title: '<strong style="color:#ffcc00;">Renew Subscription (Demo)</strong>',
      html: `
        <div style="color:#f0f0f0; font-family:'Segoe UI', Tahoma, sans-serif; text-align:left;">
          <label for="planSelect">Select Plan:</label>
          <select id="planSelect" style="width:100%; margin-top:5px; padding:5px; border-radius:6px;">
            ${this.subscriptionPlans.map(p => `<option value="${p.amount}" data-name="${p.name}">${p.name} - ₹${p.amount}</option>`).join('')}
          </select>
          <div style="margin-top:15px; text-align:center;">
            <button id="payBtn" style="padding:8px 15px; background:#ffcc00; color:#000; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
              Pay Now (Test Mode)
            </button>
          </div>
          <div id="emailNote" style="margin-top:15px; text-align:center; cursor:pointer;" title="Click to send email">
            <p style="color:#f0f0f0; text-decoration:underline; font-weight:500; margin:0;">
              ${this.emailAddress.replace('@', '&#64;')}
            </p>
            <p style="font-size:12px; color:#cccccc; margin-top:5px;">
              Note: Please pay using GPay, PhonePe, or Paytm and upload screenshot to this mail.
            </p>
            <p id="countdown" style="font-size:14px; color:#ffcc00; margin-top:8px; font-weight:bold;">
              ${this.expiryDate ? 'Time left: calculating...' : ''}
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

        // Razorpay Test Mode Payment
        payBtn.addEventListener('click', () => {
          const amount = Number(selectEl.value);
          const planName = selectEl.selectedOptions[0].getAttribute('data-name') || 'Plan';

          this.paymentService.createOrder(amount).subscribe((order: any) => {
            const options = {
              key: 'rzp_test_RGGtv2W1TjYURz', // Test Key
              amount: order.amount,
              currency: 'INR',
              name: 'Zyct Gym',
              description: `Subscription: ${planName}`,
              order_id: order.id,
              handler: (response: any) => {
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
              prefill: { name:'Demo User', email:'demo@example.com', contact:'9999999999' },
              theme: { color:'#ffcc00' }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
          });
        });

        // Email fallback
        const openEmail = (planName: string, amount: number) => {
          const subject = encodeURIComponent(`Subscription Renew - Demo`);
          const body = encodeURIComponent(`Plan: ${planName}\nAmount: ₹${amount}\nPlease attach the screenshot.`);
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

          if (isMobile) {
            const gmailAppUrl = `googlegmail://co?to=${this.emailAddress}&subject=${subject}&body=${body}`;
            const mailtoUrl = `mailto:${this.emailAddress}?subject=${subject}&body=${body}`;
            window.location.href = gmailAppUrl;
            setTimeout(() => window.location.href = mailtoUrl, 500);
          } else {
            const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${this.emailAddress}&su=${subject}&body=${body}`;
            window.open(gmailWebUrl, '_blank');
          }
        };

        emailNote.addEventListener('click', () => {
          const amount = Number(selectEl.value);
          const planName = selectEl.selectedOptions[0].getAttribute('data-name') || 'Plan';
          openEmail(planName, amount);
        });

        // Countdown Timer
        if (this.expiryDate) {
          const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = this.expiryDate!.getTime() - now;

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
}
