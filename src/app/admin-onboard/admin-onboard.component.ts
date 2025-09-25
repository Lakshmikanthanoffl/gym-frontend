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
}

@Component({
  selector: 'app-admin-onboard',
  standalone: false,
  templateUrl: './admin-onboard.component.html',
  styleUrls: ['./admin-onboard.component.css']
})
export class AdminOnboardComponent implements OnInit {
  constructor(private memberService: MemberService) {}
  subscriptionOptions = [
    { label: 'Monthly', value: 'monthly' },
    { label: '3 Months', value: '3months' },
    { label: '6 Months', value: '6months' },
    { label: 'Yearly', value: 'yearly' }
  ];
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
  
  selectedSubscription: string = 'monthly';  // default
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
    privileges: [] // stores selected menus
  };

  availableGyms: { id: number; name: string }[] = [];

  rolesDropdown = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
    { label: 'Superadmin', value: 'superadmin' }
  ];

  ngOnInit() {
    this.loadRoles(); 
  this.setDefaultDates();  // set default Paid Date & Valid Until
  }
  // Set default dates based on subscription
  setDefaultDates() {
    const today = new Date();
    this.admin.paidDate = today;
    this.calculateValidUntil(this.selectedSubscription);
  }

  // Triggered when subscription changes
  onSubscriptionChange(value: string) {
    this.selectedSubscription = value;
    this.calculateValidUntil(value);
  }

  // Calculate Valid Until date based on subscription
  calculateValidUntil(period: string) {
    if (!this.admin.paidDate) this.admin.paidDate = new Date();
    const paid = new Date(this.admin.paidDate); // clone
    const validUntil = new Date(paid);

    switch (period) {
      case 'monthly':
        validUntil.setMonth(validUntil.getMonth() + 1);
        break;
      case '3months':
        validUntil.setMonth(validUntil.getMonth() + 3);
        break;
      case '6months':
        validUntil.setMonth(validUntil.getMonth() + 6);
        break;
      case 'yearly':
        validUntil.setFullYear(validUntil.getFullYear() + 1);
        break;
    }

    this.admin.validUntil = validUntil;
  }

  // Triggered when Paid Date changes manually
  onPaidDateChange(newDate: Date) {
    this.admin.paidDate = newDate;
    this.calculateValidUntil(this.selectedSubscription);
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
      privileges: role.privileges ?? [] // ✅ keep DB privileges when editing
    };
  
    // Make sure the subscription dropdown shows correct period
    
    
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
      privileges: [] // stores selected menus
    };
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
  
        this.rolesList = data.map(r => ({
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
          privileges: r.Privileges ?? [] // ✅ keep DB privileges if available
        }))
        // ✅ sort by RoleId ascending
        .sort((a, b) => a.roleId - b.roleId);
  
        this.filteredRolesList = [...this.rolesList];
      },
      error: err => console.error('Failed to fetch roles', err)
    });
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
      role.gymName?.toLowerCase().includes(term)
    );
  }
}
