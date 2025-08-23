import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

import { MemberService } from '../services/member.service';
import { Member } from '../models/member.model';
interface SubscriptionOption {
  label: string;
  value: string;
  period: string;
  price: number; // ✅ Add this
}


@Component({
  selector: 'app-members',
  standalone: false,
  templateUrl: './members.component.html',
  styleUrl: './members.component.css'
})

export class MembersComponent implements OnInit{
  availableGyms: { id: number; name: string }[] = [];
  gymId!: number;
  gymname!: string | null;
  constructor(private memberService: MemberService) {}
  otpSent: boolean = false;
  defaultGymId!: number;      // ✅ add this
  defaultGymName!: string;    // ✅ add this
enteredOtp: string = '';
generatedOtp: string = '';
isPhoneVerified: boolean = false;
otpDialogVisible: boolean = false;
isEditMode: boolean = false;
selectedMemberId: number | null = null;
deleteDialogVisible: boolean = false;
memberToDelete: any = null;
deleteConfirmationText: string = '';
userrole: any;
isAdmin: boolean=false;
  newMember: {
    id?: number;
    name: string;
    email: string;
    phone: string;
    subscriptionType: SubscriptionOption;
    period: string;
    amountPaid: number;
    paidDate: Date;
    validUntil: Date;
    gymId?: number;           // ✅ add this
    gymName?: string;         // ✅ add this
  } = {
    name: '',
    email: '',
    phone: '',
    subscriptionType: {
      label: 'Monthly',
      value: 'Monthly',
      period: '1 Month',
      price: 500 // ✅ Add this
    },
    period: '1 Month',
    amountPaid: 500,
    paidDate: new Date(),
    validUntil: this.calculateValidUntil('Monthly'),
    gymId: undefined,         // ✅ initialize
    gymName: undefined        // ✅ initialize
  };
  
  
  
  subscriptionTypes: SubscriptionOption[] = [
    { label: 'Monthly', value: 'Monthly', period: '1 Month', price: 600 },
    { label: 'Quarterly', value: 'Quarterly', period: '3 Months', price: 1500 },
    { label: 'Half-Yearly', value: 'Half-Yearly', period: '6 Months', price: 3200 },
    { label: 'Yearly', value: 'Yearly', period: '12 Months', price: 6000 }
  ];
  
  
  members: Member[] = [];
  filteredMembers: Member[] = [];

searchTerm: string = '';

  editDialogVisible = false;
  selectedMember: any = null;
  addDialogVisible = false;
  ngOnInit() {
    this.userrole = localStorage.getItem("role")
    this.isAdmin = this.userrole === 'admin';
    
    this.defaultGymName = localStorage.getItem('GymName') ?? '';
    this.defaultGymId = Number(localStorage.getItem('GymId')) || 0;
    this.fetchMembersFromAPI(); // 👈
    this.getgymname();
    
  }
  
  viewMember(member: any) {
    this.selectedMember = member;
    this.editDialogVisible = true;
  }
  editMember(member: any) {
    this.isEditMode = true;
    this.selectedMemberId = member.id;
  
    // Determine gym info based on role
    let gymId: number;
    let gymName: string;
  
    if (this.userrole === 'superadmin') {
      // Take from the member object itself
      gymId = member.gymId || 0;
      gymName = member.gymName || '';
    } else {
      // Use default gym info for admin
      gymId = this.defaultGymId;
      gymName = this.defaultGymName ?? '';
    }
  
    // Deep clone member to avoid live editing and preserve form state
    this.newMember = {
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      subscriptionType: {
        label: member.subscriptionType?.label || '',
        value: member.subscriptionType?.value || '',
        period: member.subscriptionType?.period || '',
        price: member.subscriptionType?.price || 0,
      },
      period: member.period,
      amountPaid: member.amountPaid,
      paidDate: member.paidDate,
      validUntil: member.validUntil,
      gymId,    // ✅ gym info based on role
      gymName   // ✅ gym info based on role
    };
  
    this.addDialogVisible = true;
  }
  
  
  transformMemberForInsert(member: Member): any {
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      subscriptionType: member.subscriptionType.value, // flatten to string
      period: member.period,
      amountPaid: member.amountPaid,
      paidDate: member.paidDate,
      validUntil: member.validUntil
    };
  }
  insertMember(member: Member) {
    const requestBody = this.transformMemberForInsert(member);
  
    this.memberService.addMember(requestBody).subscribe({
      next: () => {
        this.fetchMembersFromAPI(); // refresh list
      },
      error: (err) => {
        console.error('Insert failed:', err);
      }
    });
  }
    
  fetchMembersFromAPI() {
    const userRole = this.userrole; // e.g., 'superadmin' or 'admin'
    const gymId =  this.defaultGymId ;       // set this if admin
    const gymName = this.defaultGymName;   // set this if admin
  
    if (userRole === 'superadmin') {
      // Superadmin: fetch all members
      this.memberService.getAllMembers().subscribe({
        next: (data) => this.processMembers(data),
        error: (err) => console.error('Failed to fetch members:', err),
      });
    } else if (userRole === 'admin') {
      // Admin: fetch members by gym
      this.memberService.getMembersByGym(gymId, gymName).subscribe({
        next: (data) => this.processMembers(data),
        error: (err) => console.error('Failed to fetch members:', err),
      });
    }
  }
  isValidGym(gymId: number | null): boolean {
    if (!gymId) return false;
    return this.availableGyms.some(g => g.id === gymId);
  }
  
// Helper method to process members response

private processMembers(data: any[]) {
  this.members = data.map((m: any) => ({
    id: m.Id,
    name: m.Name,
    email: m.Email,
    phone: m.Phone,
    subscriptionType: {
      label: m.SubscriptionType?.Label || '',
      value: m.SubscriptionType?.Value || '',
      period: m.SubscriptionType?.Period || '',
      price: m.SubscriptionType?.Price || 0,
    },
    period: m.Period,
    amountPaid: m.AmountPaid,
    paidDate: new Date(m.PaidDate),
    validUntil: new Date(m.ValidUntil),
    gymId: m.GymId,
    gymName: m.GymName || '',
  }));

  this.filteredMembers = [...this.members];

  // Prepare unique gyms for the dropdown
  const gymMap = new Map<number, string>();
  this.members.forEach(m => {
    if (m.gymId && m.gymName) {
      gymMap.set(m.gymId, m.gymName);
    }
  });

  
}
getgymname(){
  if (this.userrole === 'superadmin') {
    this.memberService.getAllrole().subscribe({
      next: (data: any[]) => this.processGyms(data),
      error: (err) => console.error('Failed to fetch members:', err),
    });
  }
}
private processGyms(data: any[]) {
  const gymMap = new Map<number, string>();
  data.forEach(m => {
    if (m.GymId && m.GymName) {
      gymMap.set(m.GymId, m.GymName);
    }
  });
  this.availableGyms = Array.from(gymMap.entries()).map(([id, name]) => ({ id, name }));
}
onGymChange(selectedGymId: number) {
  const gym = this.availableGyms.find(g => g.id === selectedGymId);
  if (gym) {
    this.newMember.gymId = gym.id;
    this.newMember.gymName = gym.name;
  }
}


  
filterMembers() {
  const term = this.searchTerm?.trim().toLowerCase() || '';

  this.filteredMembers = this.members.filter((member) => {
    const nameMatch = member.name?.toLowerCase().includes(term);
    const emailMatch = member.email?.toLowerCase().includes(term);
    const phoneMatch = member.phone?.toLowerCase().includes(term);
    const status = this.getStatus(member.validUntil).toLowerCase();
    const statusMatch = status.includes(term);

    let gymMatch = false;
    if (this.userrole?.toLowerCase() === 'superadmin') {
      const gymIdStr = member.gymId?.toString() || '';
      const gymNameStr = member.gymName?.toLowerCase() || '';

      // Normal gym search
      gymMatch = gymIdStr.includes(term) || gymNameStr.includes(term);

      // Special unassigned keywords
      if ((term === 'unassigned' || term === 'no gym' || term === 'not assigned' ||term === '!') 
          && this.isUnassignedGym(member)) {
        gymMatch = true;
      }
    }

    return nameMatch || emailMatch || phoneMatch || statusMatch || gymMatch;
  });
}


isUnassignedGym(member: any): boolean {
  // Case 1: No gymId or gymName at all
  if (!member.gymId || !member.gymName) return true;

  // Case 2: GymId exists but not in availableGyms list
  const valid = this.availableGyms?.some(g => g.id === member.gymId);
  return !valid;
}

  onPaidDateChange() {
    const subType = this.newMember.subscriptionType?.value;
    if (subType) {
      this.newMember.validUntil = this.calculateValidUntil(
        subType,
        this.newMember.paidDate
      );
    }
  }
  getStatus(validUntil: Date): string {
    const today = new Date();
    const expiryDate = new Date(validUntil);
  
    // Calculate difference in milliseconds
    const timeDiff = expiryDate.getTime() - today.getTime();
  
    // Convert difference to days (round down to avoid partial day confusion)
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
      return 'text-danger font-bold';
    } else if (status.includes('Expiring Soon')) {
      return 'text-warning font-bold';
    } else if (status.includes('Active')) {
      return 'text-success font-bold';
    } else if (status.includes('Expires Today')) {
      return 'text-warning font-bold'; // treat "Expires Today" as warning
    } else {
      return '';
    }
  }
  
  
  isExpiringSoon(validUntil: string | Date): boolean {
    const today = new Date();
    const expiryDate = new Date(validUntil);
  
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const expiryMidnight = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
  
    const diffInTime = expiryMidnight.getTime() - todayMidnight.getTime();
    const diffInDays = diffInTime / (1000 * 3600 * 24);
  
    const isExpiring = diffInDays <= 7 && diffInDays >= 0;
  
    
  
    return isExpiring;
  }
  
  
  
  
  confirmDelete(member: any): void {
    this.memberToDelete = member;
    this.deleteConfirmationText = '';
    this.deleteDialogVisible = true;
  }
  deleteMember(): void {
    if (
      this.deleteConfirmationText.trim().toLowerCase() === 'delete' &&
      this.memberToDelete
    ) {
      this.memberService.deleteMember(this.memberToDelete.id).subscribe(() => {
        this.members = this.members.filter(m => m.id !== this.memberToDelete.id);
        this.memberToDelete = null;
        this.deleteDialogVisible = false;
        this.fetchMembersFromAPI();
  
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The member has been removed successfully.',
          background: '#1e1e1e',
          color: '#f5f5f5',
          confirmButtonColor: '#d63031',
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true
        });
      });
    }
  }
  
 
  
  onSubscriptionTypeChange(selected: SubscriptionOption) {
    if (selected) {
      this.newMember.period = selected.period;
      this.newMember.amountPaid = selected.price;
      this.newMember.validUntil = this.calculateValidUntil(
        selected.value,
        this.newMember.paidDate
      );
    } else {
      this.newMember.period = '';
      this.newMember.amountPaid = 0;
    }
  }
  
  sendOTP(phone: string): void {
    if (!phone || phone.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }
  
    setTimeout(() => {
      this.generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      this.otpSent = true;
      this.otpDialogVisible = true; // Show the OTP popup
      this.isPhoneVerified = false;
  
      console.log('Dummy OTP sent:', this.generatedOtp);
      alert(`Dummy OTP sent to ${phone}: ${this.generatedOtp}`);
    }, 500);
  }
  resetOtpDialog() {
    this.enteredOtp = '';
    this.otpDialogVisible = false;
    this.otpSent = false;
  }
  
  resetOtpState(): void {
    this.otpSent = false;
    this.generatedOtp = '';
    this.enteredOtp = '';
    this.isPhoneVerified = false;
    this.otpDialogVisible = false;
  
    // Get gym info from localStorage
    const gymId = Number(localStorage.getItem('GymId')) || 0;
    const gymName = localStorage.getItem('GymName') ?? '';
  
    // Reset member form fields with valid default values
    this.newMember = {
      name: '',
      email: '',
      phone: '',
      subscriptionType: {
        label: 'Monthly',
        value: 'Monthly',
        period: '1 Month',
        price: 500
      },
      period: '1 Month',
      amountPaid: 500,
      paidDate: new Date(),
      validUntil: this.calculateValidUntil('Monthly'),
      gymId,     // set gymId
      gymName    // set gymName
    };
  
    this.isEditMode = false;
    this.selectedMemberId = null;
  }
  
  
  
  
  verifyOTP(): void {
    if (this.enteredOtp === this.generatedOtp) {
      this.isPhoneVerified = true;
      this.otpDialogVisible = false; // Close the OTP popup
      alert('Phone number verified!');
    } else {
      alert('Invalid OTP. Please try again.');
    }
  }
  
  calculateValidUntil(subscriptionType: string, startDate?: Date): Date {
    const validDate = new Date(startDate || new Date()); // fallback to current date
  
    switch (subscriptionType) {
      case 'Monthly':
        validDate.setMonth(validDate.getMonth() + 1);
        break;
      case 'Quarterly':
        validDate.setMonth(validDate.getMonth() + 3);
        break;
      case 'Half-Yearly':
        validDate.setMonth(validDate.getMonth() + 6);
        break;
      case 'Yearly':
        validDate.setFullYear(validDate.getFullYear() + 1);
        break;
    }
  
    return validDate;
  }
  



  showAddDialog() {
    const defaultOption = this.subscriptionTypes.find(opt => opt.value === 'Monthly')!;
    const now = new Date();
  
    let gymId: number;
    let gymName: string;
  
    if (this.userrole === 'superadmin') {
      // For superadmin, keep gym fields empty
      gymId = 0;
      gymName = '';
    } else {
      // For admin, use default gym info
      gymId = this.defaultGymId;
      gymName = this.defaultGymName;
    }
  
    this.addDialogVisible = true;
    this.newMember = {
      id: this.members.length + 1,
      name: '',
      email: '',
      phone: '',
      subscriptionType: defaultOption,
      period: defaultOption.period,
      amountPaid: defaultOption.price,
      paidDate: now,
      validUntil: this.calculateValidUntil(defaultOption.value, now),
      gymId,    // ✅ based on role
      gymName   // ✅ based on role
    };
  }
  
  closeDialog() {
    this.addDialogVisible = false;
    this.fetchMembersFromAPI();
    
    this.resetOtpState();
  }
  
  saveMember() {
    const { name, email, phone, subscriptionType, validUntil } = this.newMember;
  
    // ✅ Field Validations
    if (!name?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter the member name.',
        background: '#1e1e1e',
        color: '#f5f5f5',
        confirmButtonColor: '#d63031'
      });
      return;
    }
  
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter a valid email address.',
        background: '#1e1e1e',
        color: '#f5f5f5',
        confirmButtonColor: '#d63031'
      });
      return;
    }
  
    if (!phone?.trim() || phone.length < 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter a valid phone number (10 digits).',
        background: '#1e1e1e',
        color: '#f5f5f5',
        confirmButtonColor: '#d63031'
      });
      return;
    }
  
    if (!subscriptionType) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select a subscription type.',
        background: '#1e1e1e',
        color: '#f5f5f5',
        confirmButtonColor: '#d63031'
      });
      return;
    }
  
    if (!this.newMember.amountPaid || this.newMember.amountPaid <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter a valid amount paid.',
        background: '#1e1e1e',
        color: '#f5f5f5',
        confirmButtonColor: '#d63031'
      });
      return;
    }
  
    if (!validUntil) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please provide a valid end date.',
        background: '#1e1e1e',
        color: '#f5f5f5',
        confirmButtonColor: '#d63031'
      });
      return;
    }
  
    // ✅ Duplicate Validation (skip self in edit mode)
    const duplicatePhone = this.members.some(
      m => m.phone === phone && m.id !== this.selectedMemberId
    );
    if (duplicatePhone) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Found',
        text: `Phone number ${phone} is already registered.`,
        background: '#1e1e1e',
        color: '#f5f5f5',
        confirmButtonColor: '#d63031'
      });
      return;
    }
  
    const duplicateEmail = this.members.some(
      m => m.email.toLowerCase() === email.toLowerCase() && m.id !== this.selectedMemberId
    );
    if (duplicateEmail) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Found',
        text: `Email ${email} is already registered.`,
        background: '#1e1e1e',
        color: '#f5f5f5',
        confirmButtonColor: '#d63031'
      });
      return;
    }
  
    // ✅ Gym info based on role
    let gymId: number;
    let gymName: string;
  
    if (this.userrole === 'superadmin') {
      gymId = Number(this.newMember.gymId) || 0;
      gymName = this.newMember.gymName ?? '';
    } else {
      gymId = Number(localStorage.getItem('GymId')) || 0;
      gymName = localStorage.getItem('GymName') ?? '';
    }
  
    // ✅ Edit mode
    if (this.isEditMode && this.selectedMemberId != null) {
      const updatedMember: Member = {
        ...this.newMember,
        id: this.selectedMemberId,
        subscriptionType,
        validUntil,
        gymId,
        gymName
      };
  
      this.memberService.updateMember(updatedMember).subscribe(() => {
        const index = this.members.findIndex(m => m.id === this.selectedMemberId);
        if (index !== -1) {
          this.members[index] = { ...updatedMember };
          this.members = [...this.members];
        }
        this.closeDialog();
        Swal.fire({
          icon: 'success',
          title: 'Member Updated!',
          text: `${updatedMember.name} has been updated successfully.`,
          background: '#1e1e1e',
          color: '#f5f5f5',
          confirmButtonColor: '#00b894',
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true
        });
      });
    } else {
      // ✅ Add mode
      const memberToAdd: Member = {
        ...this.newMember,
        id: 0,
        subscriptionType,
        validUntil,
        gymId,
        gymName
      };
  
      this.memberService.addMember(memberToAdd).subscribe((createdMember: Member) => {
        this.members = [...this.members, createdMember];
        this.closeDialog();
  
        Swal.fire({
          icon: 'success',
          title: 'Member Added!',
          text: `${this.newMember.name} has been added successfully.`,
          background: '#1e1e1e',
          color: '#f5f5f5',
          confirmButtonColor: '#00b894',
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true
        });
      });
    }
  }
  
  
  
  
  
  
  
  
  
}
