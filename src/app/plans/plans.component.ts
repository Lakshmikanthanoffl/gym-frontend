import { Component } from '@angular/core';

@Component({
  selector: 'app-plans',
  standalone: false,
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.css'
})
export class PlansComponent {
  plans = [
    { name: 'Monthly', price: 600, duration: '1 Month' },
    { name: 'Quarterly', price: 1500, duration: '3 Months' },
    { name: 'Half-yearly', price: 3200, duration: '6 Months' },
    { name: 'Yearly', price: 6000, duration: '12 Months' }
  ];

  selectedPlan: any = null;
  checkoutVisible: boolean = false;

  openCheckout(plan: any) {
    this.selectedPlan = plan;
    this.checkoutVisible = true;
  }

  confirmPayment() {
    alert(`Payment successful for ${this.selectedPlan.name} plan!`);
    this.checkoutVisible = false;
  }

  cancelCheckout() {
    this.checkoutVisible = false;
    this.selectedPlan = null;
  }
}
