import { Component } from '@angular/core';

@Component({
  selector: 'app-plans',
  standalone: false,
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.css'
})
export class PlansComponent {
  plans = [
    { 
      name: 'Monthly', 
      price: 600, 
      duration: '1 Month', 
      currency: '₹',
      features: [
        { text: "Access to Gym Equipment", available: true },
        { text: "1 Personal Training Session", available: false }
      ]
    },
    { 
      name: 'Quarterly', 
      price: 1500, 
      duration: '3 Months', 
      currency: '₹',
      features: [
        { text: "Access to Gym Equipment", available: true },
        { text: "3 Personal Training Sessions", available: true },
        { text: "Group Classes (Yoga/Zumba)", available: true }
      ]
    },
    { 
      name: 'Half-yearly', 
      price: 3200, 
      duration: '6 Months', 
      currency: '₹',
      features: [
        { text: "Access to Gym Equipment", available: true },
        { text: "6 Personal Training Sessions", available: true },
        { text: "Group Classes (Yoga/Zumba)", available: true },
        { text: "Diet Consultation", available: false }
      ]
    },
    { 
      name: 'Yearly', 
      price: 6000, 
      duration: '12 Months', 
      currency: '₹',
      features: [
        { text: "Access to Gym Equipment", available: true },
        { text: "12 Personal Training Sessions", available: true },
        { text: "Group Classes (Yoga/Zumba)", available: true },
        { text: "Diet Consultation", available: true },
        { text: "Free Merchandise (T-shirt/Shaker)", available: true }
      ]
    }
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
