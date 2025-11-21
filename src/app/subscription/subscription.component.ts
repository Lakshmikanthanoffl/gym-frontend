import { Component, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import QRCode from 'qrcode';
import { PaymentService } from '../services/payment.service';
import { AuthService } from '../services/auth.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MemberService } from '../services/member.service';



type PlanName = 'Basic' | 'Advanced' | 'Premium';
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
  isBlinking!: boolean;
  currentUserRoleId!: string | null;
  currentUserName!: string | null;

planName: string = '';
  constructor(private paymentService: PaymentService,private authService:AuthService,private memberService: MemberService) { }
  ngOnInit(): void {
    this.planName = localStorage.getItem('PlanName') || 'Free';
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
                      title: 'Payment Successful!',
                      text: 'Your subscription has been updated successfully!!! check Downloads For Receipt.',
                      showConfirmButton: true,
                      confirmButtonText: 'OK',
                      confirmButtonColor: '#3085d6', // professional blue
                      iconColor: '#28a745',          // green success icon
                      background: '#f7f7f7',         // light gray background
                      timer: 5000,                    // auto close after 5 seconds (optional)
                      timerProgressBar: true,
                      showClass: {
                        popup: 'animate__animated animate__fadeInDown' // requires animate.css
                      },
                      hideClass: {
                        popup: 'animate__animated animate__fadeOutUp'
                      }
                    })
                  .then(() => {

  // --------------------------------------
  // 🔥 Auto update admin subscription logic
  // --------------------------------------


// 🔥 Call API with selected plan values
this.updateSubscription(planName as PlanName, durationType, amount, (updatedData) => {

  // Use updated values from API or fallback to local generated values
  updatedRole.ValidUntil = updatedData.validUntil ?? updatedRole.ValidUntil;
  updatedRole.PaidDate = updatedData.paidDate ?? updatedRole.PaidDate;
  updatedRole.AmountPaid = updatedData.amountPaid ?? updatedRole.AmountPaid;
  updatedRole.SubscriptionPeriod = updatedData.subscriptionPeriod;
  updatedRole.PlanName = updatedData.planName;


  // 👇 Store updated values
  if (updatedRole.ValidUntil) {
    localStorage.setItem('validUntil', updatedRole.ValidUntil);
    this.authService['validUntilSubject'].next(updatedRole.ValidUntil);
  }

  if (updatedRole.PaidDate) {
    localStorage.setItem('startDate', updatedRole.PaidDate);
    this.authService['PaidDateSubject'].next(updatedRole.PaidDate);
  }

  localStorage.setItem('isActive', 'true');
  this.authService['isActiveSubject'].next(true);
  if (updatedRole.Privileges)
   {
    this.authService.setPrivileges(updatedRole.Privileges); 
  }
  // 🎟 Generate receipt then reload
  this.generateReceipt(updatedRole, amount, response, planName, durationText)
    .then(() => window.location.reload());
});


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
  
  
  calculateValidity(type: string): Date {
    const date = new Date();
  
    switch (type) {
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
  
    return date;
  }
  updateSubscription(planName: PlanName, durationType: string, amount: number, callback?: (updatedData: any) => void) {

    const payload = {
      planName: planName,
      subscriptionPeriod: durationType,
      amountPaid: amount,
      paidDate: new Date(),
      validUntil: this.calculateValidity(durationType)
    };
  
    this.memberService.updateSubscription(Number(this.currentUserRoleId), payload)
      .subscribe({
        next: (response) => {
          console.log("Subscription updated", response);
  
          // return updated values to caller
          if (callback) callback(payload);
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: 'Unable to update subscription. Please try again.'
          });
        }
      });
  }
  
  
  
  
 
  generateReceipt(updatedRole: any, amount: number, response: any, planName: string,  planType: string): Promise<void> {
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
