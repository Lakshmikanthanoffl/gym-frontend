import { Component, OnInit } from '@angular/core';
import { MemberService } from '../services/member.service'; 
import Swal from 'sweetalert2';

export interface Role {
  roleId: number;
  roleName: string;
  userName: string;
  userEmail: string;
  password: string;
  gymId: number | null;
  gymName: string;
  paidDate?: Date | null;
  validUntil?: Date | null;
  amountPaid?: number;
  isActive?: boolean;
  privileges: string[]; // ✅ array of menu keys
  planName?: PlanName;         // ✅ NEW field
  subscriptionPeriod?: string; // ✅ Monthly / Quarterly / Yearly
  planDisplay?: string; // ✅ Add planDisplay here

}
type PlanName = 'Basic' | 'Advanced' | 'Premium';


@Component({
  selector: 'app-admin-onboard',
  standalone: false,
  templateUrl: './admin-onboard.component.html',
  styleUrls: ['./admin-onboard.component.css']
})
export class AdminOnboardComponent implements OnInit {
  constructor(private memberService: MemberService) {}
  selectedPlan: any = null;
  selectedSubscription: string = 'monthly';  
   availableMenus = [
    { label: 'Dashboard', value: 'dashboard' },
    { label: 'Members', value: 'members' },
    { label: 'Plans', value: 'plans' },
    { label: 'Payments', value: 'payments' },
    { label: 'Subscription', value: 'subscription' },
    { label: 'Admin Onboard', value: 'admin-onboard' },
    { label: 'Export Data', value: 'export' }, // ✅ new export option
    { label: 'Qr Attendance Tracking', value: 'Qr Attendance-Tracking' },
    { label: 'Manual Attendance Tracking', value: 'manual Attendance-Tracking' } // ✅ new export option // ✅ new export option
   
  ];
  
  planAccessPoints: Record<PlanName, string[]> = {
    Basic: [
      'members',
      'export',
      'plans',
      'subscription'
    ],
    Advanced: [
      'dashboard',
      'members',
      'export',
      'manual Attendance-Tracking',
      'Qr Attendance-Tracking',
      'plans',
      'subscription'
    ],
    Premium: [
      'dashboard',
      'members',
      'plans',
      'payments',
      'subscription',
      'export',
      'Qr Attendance-Tracking',
      'manual Attendance-Tracking'
    ]
  };
  
  // ✅ Available Plans
  subscriptionPlans = [
    {
      name: 'Basic',
      description: '🚀 Ideal for small gyms and beginners starting their journey.',
      monthly: 7999,
      quarterly: Math.round(7999 * 3 * 0.9),
      yearly: Math.round(7999 * 12 * 0.8)
    },
    {
      name: 'Advanced',
      description: '🌟 Perfect for growing gyms – unlock full potential!',
      monthly: 10000,
      quarterly: Math.round(10000 * 3 * 0.9),
      yearly: Math.round(10000 * 12 * 0.8)
    },
    {
      name: 'Premium',
      description: '👑 All-in-one solution for professional gyms',
      monthly: 13000,
      quarterly: Math.round(13000 * 3 * 0.9),
      yearly: Math.round(13000 * 12 * 0.8)
    }
  ];

  
  rolesList: Role[] = [];
  filteredRolesList: Role[] = [];
  showDialog: boolean = false;
  userrole: string = 'superadmin';
  isEditMode: boolean = false;
  passwordVisible: boolean = false;
  manualGymEntry: boolean = false;
  deleteDialogVisible: boolean = false;
  roleToDelete: any = null;
  deleteConfirmationText: string = '';
  searchTerm: string = '';

  admin: Role = {
    roleId: 0,
    roleName: 'admin',
    userName: '',
    userEmail: '',
    password: '',
    gymId: null,
    gymName: '',
    paidDate: null,
    validUntil: null,
    amountPaid: 0,
    isActive: true,
    privileges: [],
    planName: 'Basic',            // ✅ default plan
    subscriptionPeriod: 'monthly' // ✅ default subscription
  };

  availableGyms: { id: number; name: string }[] = [];

  rolesDropdown = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
    { label: 'Superadmin', value: 'superadmin' }
  ];

  ngOnInit() {
    window.addEventListener('keydown', this.handleAltShortcuts.bind(this));
    this.loadRoles(); 
  this.setDefaultDates();  // set default Paid Date & Valid Until
  }
  ngOnDestroy() {
    window.removeEventListener('keydown', this.handleAltShortcuts.bind(this));
  }

  handleAltShortcuts(event: KeyboardEvent) {
    if (!event.altKey) return; // only handle Alt + key
  
    switch (event.key.toLowerCase()) {
      case 'p': // Premium
        this.searchTerm = 'premium';
        break;
      case 'a': // Advanced
        this.searchTerm = 'advanced';
        break;
      case 'b': // Basic
        this.searchTerm = 'basic';
        break;
      case 'x': // Clear filter
        this.searchTerm = '';
        break;
      default:
        return; // do nothing for other keys
    }
  
    this.filterRoles(); // trigger filtering
  }
  
  
  // Set default dates based on subscription
  setDefaultDates() {
    const today = new Date();
    this.admin.paidDate = today;
    this.calculateValidUntil(this.admin.subscriptionPeriod!);
  }

    // ✅ Subscription change
  onSubscriptionChange(period: string) {
    this.admin.subscriptionPeriod = period;
    this.updateAmount();
    this.calculateValidUntil(period);
  }
  // ✅ Plan change → reset subscription to Monthly + auto privileges
onPlanChange(planName: string) {
  this.admin.planName = planName as PlanName;   // ✅ type-safe cast

  this.admin.subscriptionPeriod = 'monthly'; 

  this.updateAmount();
  this.calculateValidUntil('monthly');

  // ✅ Auto-select privileges based on plan
  if (this.admin.planName && this.planAccessPoints[this.admin.planName as PlanName]) {
    this.admin.privileges = [...this.planAccessPoints[this.admin.planName as PlanName]];
  }
  else {
    this.admin.privileges = [];
  }
}

  // ✅ Update amount
  updateAmount() {
    const plan = this.subscriptionPlans.find(p => p.name === this.admin.planName);
    if (!plan) return;

    switch (this.admin.subscriptionPeriod) {
      case 'monthly': this.admin.amountPaid = plan.monthly; break;
      case 'quarterly': this.admin.amountPaid = plan.quarterly; break;
      case 'yearly': this.admin.amountPaid = plan.yearly; break;
    }
  }
  
  
 // ✅ Calculate Valid Until
 calculateValidUntil(period: string) {
  if (!this.admin.paidDate) this.admin.paidDate = new Date();
  const paid = new Date(this.admin.paidDate);
  const validUntil = new Date(paid);

  switch (period) {
    case 'monthly': validUntil.setMonth(validUntil.getMonth() + 1); break;
    case 'quarterly': validUntil.setMonth(validUntil.getMonth() + 3); break;
    case 'yearly': validUntil.setFullYear(validUntil.getFullYear() + 1); break;
  }
  this.admin.validUntil = validUntil;
}
  onPaidDateChange(newDate: Date) {
    this.admin.paidDate = newDate;
    this.calculateValidUntil(this.admin.subscriptionPeriod!);
  }
  openAddAdminDialog() {
    this.isEditMode = false;
    this.passwordVisible = false;
    this.manualGymEntry = false;
    this.resetAdmin();
    this.setDefaultDates(); // reset dates when opening dialog
    this.showDialog = true;
  }

  editRole(role: Role) {
    this.isEditMode = true;
    this.passwordVisible = false;
  
    // Determine if gym is from dropdown or manual entry
    this.manualGymEntry = !this.availableGyms.some(g => g.id === role.gymId);
  
    // Determine plan and subscription based on amountPaid
    let planName: PlanName = 'Basic';
    let subscriptionPeriod: 'monthly' | 'quarterly' | 'yearly' = 'monthly';
  
    for (const plan of this.subscriptionPlans) {
      if (role.amountPaid === plan.monthly) {
        planName = plan.name as PlanName;
        subscriptionPeriod = 'monthly';
        break;
      } else if (role.amountPaid === plan.quarterly) {
        planName = plan.name as PlanName;
        subscriptionPeriod = 'quarterly';
        break;
      } else if (role.amountPaid === plan.yearly) {
        planName = plan.name as PlanName;
        subscriptionPeriod = 'yearly';
        break;
      }
    }
  
    // Populate admin object
    this.admin = {
      roleId: role.roleId,
      roleName: role.roleName,
      userName: role.userName,
      userEmail: role.userEmail,
      password: role.password, // keep empty for security
      gymId: role.gymId,
      gymName: role.gymName,
      paidDate: role.paidDate ? new Date(role.paidDate) : null,
      validUntil: role.validUntil ? new Date(role.validUntil) : null,
      amountPaid: role.amountPaid ?? 0,
      isActive: role.isActive ?? true,
      planName: planName,
      subscriptionPeriod: subscriptionPeriod,
      privileges: role.privileges?.length
        ? [...role.privileges]   // ✅ use privileges from role
        : [...this.planAccessPoints[planName]] // fallback to plan
    };
  
    this.showDialog = true;
  }
  
  

  onGymChange(selectedGymId: number) {
    const gym = this.availableGyms.find(g => g.id === selectedGymId);
    if (gym) {
      this.admin.gymId = gym.id;
      this.admin.gymName = gym.name;
    }
  }

  saveAdmin() {
    if (!this.admin.roleName || !this.admin.userName || !this.admin.userEmail || !this.admin.password || !this.admin.gymName) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill all required fields.',
        background: '#1e1e1e',
        color: '#f5f5f5',
        confirmButtonColor: '#d63031'
      });
      return;
    }

    const payload = { ...this.admin };

    this.memberService.addRole(payload).subscribe({
      next: () => {
        this.loadRoles();
        this.showDialog = false;
        this.resetAdmin();
        Swal.fire({
          icon: 'success',
          title: 'Admin Added!',
          text: 'The admin has been created successfully.',
          background: '#1e1e1e',
          color: '#f5f5f5',
          confirmButtonColor: '#00b894',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => this.handleError(err, 'Failed to save admin')
    });
  }

  updateAdmin() {
    const payload = { ...this.admin };

    this.memberService.updateRole(this.admin.roleId, payload).subscribe({
      next: () => {
        this.loadRoles();
        this.showDialog = false;
        this.resetAdmin();
        this.isEditMode = false;
        Swal.fire({
          icon: 'success',
          title: 'Admin Updated!',
          text: 'The admin details were updated successfully.',
          background: '#1e1e1e',
          color: '#f5f5f5',
          confirmButtonColor: '#00b894',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => this.handleError(err, 'Failed to update admin')
    });
  }

  confirmDeleteRole(role: any) {
    this.roleToDelete = role;
    this.deleteDialogVisible = true;
    this.deleteConfirmationText = '';
  }

  deleteRole() {
    if (this.deleteConfirmationText.trim().toLowerCase() === 'delete') {
      this.memberService.deleteRole(this.roleToDelete.roleId).subscribe({
        next: () => {
          this.rolesList = this.rolesList.filter(r => r.roleId !== this.roleToDelete.roleId);
          this.deleteDialogVisible = false;
          this.roleToDelete = null;
          this.deleteConfirmationText = '';
          this.loadRoles();
          Swal.fire({
            icon: 'success',
            title: 'Role Deleted!',
            text: 'The role has been deleted successfully.',
            background: '#1e1e1e',
            color: '#f5f5f5',
            confirmButtonColor: '#00b894',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => this.handleError(err, 'Failed to delete role')
      });
    }
  }

// ✅ Reset admin with defaults + auto privileges
private resetAdmin() {
  this.admin = {
    roleId: 0,
    roleName: 'admin',
    userName: '',
    userEmail: '',
    password: '',
    gymId: null,
    gymName: '',
    paidDate: null,
    validUntil: null,
    amountPaid: 0,
    isActive: true,
    privileges: [],      // will be set below
    planName: 'Basic',   // ✅ default plan
    subscriptionPeriod: 'monthly'
  };

  this.setDefaultDates();
  this.updateAmount();

  // ✅ Default privileges for Basic plan
  this.admin.privileges = [...this.planAccessPoints['Basic']];
}

  private handleError(err: any, fallbackMessage: string) {
    let messages: string[] = [];
    if (err.error?.errors) {
      messages = Object.values(err.error.errors).flat().map(e => String(e));
    } else if (err.error?.title) {
      messages = [err.error.title];
    } else {
      messages = [fallbackMessage];
    }
    Swal.fire({
      icon: 'error',
      title: 'Error',
      html: messages.join('<br>'),
      background: '#1e1e1e',
      color: '#f5f5f5',
      confirmButtonColor: '#d63031'
    });
  }

  private processGyms(data: any[]) {
    const gymMap = new Map<number, string>();
    data.forEach(m => {
      if (m.GymId && m.GymName) gymMap.set(m.GymId, m.GymName);
    });
    this.availableGyms = Array.from(gymMap.entries()).map(([id, name]) => ({ id, name }));
  }

  loadRoles() {
    this.memberService.getRoles().subscribe({
      next: (data: any[]) => {
        this.processGyms(data);
  
        this.rolesList = data.map(r => {
          const role: Role = {
            roleId: r.RoleId,
            roleName: r.RoleName,
            userName: r.UserName,
            userEmail: r.UserEmail,
            password: r.Password,
            gymId: r.GymId,
            gymName: r.GymName,
            paidDate: r.PaidDate ? new Date(r.PaidDate) : null,
            validUntil: r.ValidUntil ? new Date(r.ValidUntil) : null,
            amountPaid: r.AmountPaid ?? 0,
            isActive: r.IsActive ?? true,
            privileges: r.Privileges ?? [],
            planDisplay: this.getPlanDisplay(r.AmountPaid ?? 0) // ✅ set it here
          };
        
          return role;
        }).sort((a, b) => a.roleId - b.roleId);
        
        this.filteredRolesList = [...this.rolesList];
      },
      error: err => console.error('Failed to fetch roles', err)
    });
  }
  
  getPlanClass(plan?: string): string {
    if (!plan) return '';
    if (plan.startsWith('Premium')) return 'plan-premium';
    if (plan.startsWith('Advanced')) return 'plan-advanced';
    if (plan.startsWith('Basic')) return 'plan-basic';
    return '';
  }
  
  
  
  getPlanDisplay(amount: number): string {
    const plan = this.subscriptionPlans.find(p => 
      p.monthly === amount || p.quarterly === amount || p.yearly === amount
    );
  
    if (!plan) return 'Unknown';
  
    if (plan.monthly === amount) return `${plan.name} - Monthly`;
    if (plan.quarterly === amount) return `${plan.name} - Quarterly`;
    if (plan.yearly === amount) return `${plan.name} - Yearly`;
  
    return 'Unknown';
  }
  
  getStatus(validUntil: Date): string {
    if (!validUntil) return 'Unknown';
  
    const today = new Date();
    const expiryDate = new Date(validUntil);
  
    // Calculate difference in days
    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysLeft = Math.floor(timeDiff / (1000 * 3600 * 24));
  
    if (daysLeft < 0) {
      return 'Expired';
    } else if (daysLeft === 0) {
      return 'Expires Today';
    } else if (daysLeft <= 7) {
      return `Expiring Soon (${daysLeft} day${daysLeft > 1 ? 's' : ''} left)`;
    } else {
      return `Active (${daysLeft} day${daysLeft > 1 ? 's' : ''} left)`;
    }
  }
  
  getStatusClass(validUntil: Date): string {
    const status = this.getStatus(validUntil);
  
    if (status.includes('Expired')) {
      return 'text-danger font-bold';   // 🔴 red
    } else if (status.includes('Expiring Soon')) {
      return 'text-warning font-bold';  // 🟡 yellow
    } else if (status.includes('Expires Today')) {
      return 'text-warning font-bold';  // 🟡 yellow
    } else if (status.includes('Active')) {
      return 'text-success font-bold';  // 🟢 green
    } else {
      return '';
    }
  }
  
  filterRoles() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredRolesList = [...this.rolesList];
      return;
    }
  
    this.filteredRolesList = this.rolesList.filter(role =>
      role.roleName?.toLowerCase().includes(term) ||
      role.userName?.toLowerCase().includes(term) ||
      role.userEmail?.toLowerCase().includes(term) ||
      (role.gymId !== null ? role.gymId.toString().includes(term) : false) ||
      role.gymName?.toLowerCase().includes(term) ||
      role.planDisplay?.toLowerCase().includes(term) // ✅ search by plan
    );
  }
  
}
