import { Component, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import QRCode from 'qrcode';
import { PaymentService } from '../services/payment.service';
import { AuthService } from '../services/auth.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    { name: 'Monthly', amount: 1 },
    { name: '3 Months', amount: 1 },
    { name: 'Yearly', amount: 1 }
  ];
  isBlinking!: boolean;
  currentUserRoleId!: string | null;
  currentUserName!: string | null;
  constructor(private paymentService: PaymentService,private authService:AuthService) { }
  ngOnInit(): void {
    const validUntilStr = localStorage.getItem('validUntil');
    this.currentUserRoleId = localStorage.getItem('RoleId');
    this.currentUserName = localStorage.getItem('currentUserName');
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
              Note: Please refresh the screen or Logout and login once again if the subscritption is not reflected <span style="color:#ffcc00; font-weight:bold;"></span>, 
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
          const roleId = this.currentUserRoleId; // logged-in user's RoleId
        
          this.paymentService.createOrder(amount).subscribe((order: any) => {
            const options = {
              key: 'rzp_test_RIYosIVFWWyoSn', // Razorpay Key ID (frontend only)
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
                  RazorpaySignature: response.razorpay_signature,
                  RoleId: Number(roleId),
                  Amount: amount,
                  PlanName: planName
                }).subscribe((res: any) => {
                  if (res.success) {
                    const updatedRole = res.role;
                
                    Swal.fire({
                      icon: 'success',
                      title: 'Payment Successful! Subscription updated 🎉',
                      confirmButtonText: 'OK'
                    }).then(() => {
                      // ✅ Update subscription data in localStorage & BehaviorSubjects
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
                      

                     
                    });
                   

                  } else {
                    Swal.fire({
                      icon: 'error',
                      title: 'Payment Verification Failed!'
                    });
                  }
                });
                
              },
              prefill: { name: this.currentUserName }, // Only name
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
