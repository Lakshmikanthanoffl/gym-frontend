import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-plans',
  standalone: false,
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css']
})
export class PlansComponent implements OnInit {

  allPlans = [
    // Existing vetrigym plans
    { gymId: '679', gymName: 'fitgyms', name: 'Monthly', price: 600, duration: '1 Month', currency: '₹', features: [ { text: "Access to Gym Equipment", available: true }, { text: "1 Personal Training Session", available: false } ] },
    { gymId: '679', gymName: 'fitgyms', name: 'Quarterly', price: 1500, duration: '3 Months', currency: '₹', features: [ { text: "Access to Gym Equipment", available: true }, { text: "3 Personal Training Sessions", available: true }, { text: "Group Classes (Yoga/Zumba)", available: true } ] },
  
    // New fitgyms plans
    { gymId: '679', gymName: 'fitgyms', name: 'Monthly', price: 650, duration: '1 Month', currency: '₹', features: [ { text: "Access to Gym Equipment", available: true }, { text: "2 Personal Training Sessions", available: true } ] },
    { gymId: '679', gymName: 'fitgyms', name: 'Quarterly', price: 1700, duration: '3 Months', currency: '₹', features: [ { text: "Access to Gym Equipment", available: true }, { text: "4 Personal Training Sessions", available: true } ] },

     // New fitgyms plans
     { gymId: '356', gymName: 'sharu gym', name: 'Monthly', price: 650, duration: '1 Month', currency: '₹', features: [ { text: "Access to Gym Equipment", available: true }, { text: "2 Personal Training Sessions", available: true } ] },
     { gymId: '356', gymName: 'sharu gym', name: 'Quarterly', price: 1700, duration: '3 Months', currency: '₹', features: [ { text: "Access to Gym Equipment", available: false }, { text: "4 Personal Training Sessions", available: true } ] },
  ];
  searchText: string = ''; // for SuperAdmin search
filteredPlans: any[] = [];

  plans: any[] = [];
  gymName: string = '';

  ngOnInit() {
    const gymId = localStorage.getItem('GymId');
    const gymName = localStorage.getItem('GymName');
    const role = localStorage.getItem('role'); // SuperAdmin or User
  
    if (role === 'superadmin') {
      // Group plans by gym
      const gyms = new Map<string, { gymName: string, plans: any[] }>();
      this.allPlans.forEach(plan => {
        if (!gyms.has(plan.gymId)) {
          gyms.set(plan.gymId, { gymName: plan.gymName, plans: [] });
        }
        gyms.get(plan.gymId)?.plans.push(plan);
      });
      this.plans = Array.from(gyms.values());
      this.filteredPlans = this.plans; // initially show all
      this.gymName = 'All Gyms';
    } else if (gymId && gymName) {
      // Normal user – just show plans as a flat array
      this.plans = this.allPlans.filter(plan => plan.gymId === gymId && plan.gymName === gymName);
      this.gymName = gymName;
    }
  }
  
  get isSuperAdminView(): boolean {
    return this.plans.length > 0 && !!this.plans[0].plans;
  }
  
  // Call this on input change
  filterGyms() {
    this.filteredPlans = this.plans.filter(gym =>
      gym.gymName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
