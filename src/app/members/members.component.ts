import { Component, OnInit } from '@angular/core';

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
    this.fetchMembersFromAPI(); // 👈 
    this.defaultGymName = localStorage.getItem('GymName') ?? '';
    this.defaultGymId = Number(localStorage.getItem('GymId')) || 0;
    this.defaultGymId = Number(this.gymId) || 0;          // convert string | null to number
    this.defaultGymName = this.gymname ?? '';             // convert string | null to string
    
  }
  
  viewMember(member: any) {
    this.selectedMember = member;
    this.editDialogVisible = true;
  }
  editMember(member: any) {
    this.isEditMode = true;
    this.selectedMemberId = member.id;
  
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
      gymId: this.defaultGymId,      
  gymName: this.defaultGymName ?? ''  // ✅ now recognized
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
      this.memberService.getAllMembers().subscribe({
        next: (data) => {
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
          }));
          this.filteredMembers = [...this.members]; 
        },
        error: (err) => {
          console.error('Failed to fetch members:', err);
        }
      });
    }
  filterMembers() {
    const term = this.searchTerm.toLowerCase();
  
    this.filteredMembers = this.members.filter((member) => {
      const nameMatch = member.name.toLowerCase().includes(term);
      const emailMatch = member.email.toLowerCase().includes(term);
      const phoneMatch = member.phone.toLowerCase().includes(term);
      const status = this.getStatus(member.validUntil).toLowerCase();
      const statusMatch = status.includes(term);
  
      return nameMatch || emailMatch || phoneMatch || statusMatch;
    });
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
        // Remove from UI after successful deletion
        this.members = this.members.filter(m => m.id !== this.memberToDelete.id);
        this.memberToDelete = null;
        this.deleteDialogVisible = false;
        this.fetchMembersFromAPI();
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
      gymId: this.defaultGymId,      // ✅ now recognized
      gymName: this.defaultGymName   // ✅ now recognized
    };
  }
  closeDialog() {
    this.addDialogVisible = false;
    this.fetchMembersFromAPI();
    
    this.resetOtpState();
  }
  
  saveMember() {
    const { subscriptionType, validUntil } = this.newMember;
  
    // Get gym info from localStorage and ensure proper types
    const gymId = Number(localStorage.getItem('GymId')) || 0;
    const gymName = localStorage.getItem('GymName') ?? '';
  
    if (this.isEditMode && this.selectedMemberId != null) {
      // Edit mode: update existing member by ID
      const index = this.members.findIndex(m => m.id === this.selectedMemberId);
      if (index !== -1) {
        const updatedMember: Member = {
          ...this.newMember,
          id: this.selectedMemberId,
          subscriptionType,
          validUntil,
          gymId,      // include gymId
          gymName     // include gymName
        };
  
        this.memberService.updateMember(updatedMember).subscribe(() => {
          // Update the member in-place to avoid changing order
          this.members[index] = { ...updatedMember };
          this.members = [...this.members]; // Trigger Angular change detection
          this.closeDialog();
        });
      }
    } else {
      // Add new member: backend will assign ID
      const memberToAdd: Member = {
        ...this.newMember,
        id: 0,
        subscriptionType,
        validUntil,
        gymId,      // include gymId
        gymName     // include gymName
      };
  
      this.memberService.addMember(memberToAdd).subscribe((createdMember: Member) => {
        this.members = [...this.members, createdMember]; // Append to list
        this.closeDialog();
      });
    }
  }
  
  
  
  
  
  
  
  
}
