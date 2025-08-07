import { Component, OnInit } from '@angular/core';


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
  constructor() {}
  otpSent: boolean = false;
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
    validUntil: this.calculateValidUntil('Monthly')
  };
  
  
  
  subscriptionTypes: SubscriptionOption[] = [
    { label: 'Monthly', value: 'Monthly', period: '1 Month', price: 600 },
    { label: 'Quarterly', value: 'Quarterly', period: '3 Months', price: 1500 },
    { label: 'Half-Yearly', value: 'Half-Yearly', period: '6 Months', price: 3200 },
    { label: 'Yearly', value: 'Yearly', period: '12 Months', price: 6000 }
  ];
  
  
  members = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      subscriptionType: { label: 'Monthly', value: 'Monthly', period: '1 Month', price: 600  },
      period: '1 Month',
      amountPaid: 500,
      paidDate: new Date('2025-07-01T09:30:00'),
      validUntil: new Date('2025-07-31'),
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '9123456789',
      subscriptionType: { label: 'Quarterly', value: 'Quarterly', period: '3 Months', price: 1500  },
      period: '3 Months',
      amountPaid: 1400,
      paidDate: new Date('2025-06-15T15:45:00'),
      validUntil: new Date('2025-09-15'),
    },
    {
      id: 3,
      name: 'Rahul Verma',
      email: 'rahulv@example.com',
      phone: '9871203045',
      subscriptionType: { label: 'Half-Yearly', value: 'Half-Yearly', period: '6 Months', price: 3200  },
      period: '6 Months',
      amountPaid: 2500,
      paidDate: new Date('2025-05-10T10:00:00'),
      validUntil: new Date('2025-11-10'),
    },
    {
      id: 4,
      name: 'Meena Krishnan',
      email: 'meena.k@example.com',
      phone: '9900887766',
      subscriptionType: { label: 'Yearly', value: 'Yearly', period: '12 Months', price: 6000  },
      period: '12 Months',
      amountPaid: 4800,
      paidDate: new Date('2025-01-01T08:15:00'),
      validUntil: new Date('2025-12-31'),
    },
  ];
  
  

  editDialogVisible = false;
  selectedMember: any = null;
  addDialogVisible = false;
  ngOnInit() {
    this.userrole = localStorage.getItem("role")
    this.isAdmin = this.userrole === 'admin';
  }
  viewMember(member: any) {
    this.selectedMember = member;
    this.editDialogVisible = true;
  }
  editMember(member: any) {
    this.isEditMode = true;
    this.selectedMemberId = member.id;
    this.newMember = { ...member }; // Deep copy to prevent live editing
    this.addDialogVisible = true;
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
  getStatus(validUntil: string): string {
    const today = new Date();
    const expiryDate = new Date(validUntil);
    const diffInMs = expiryDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  
    if (daysLeft < 0) {
      return 'Expired';
    } else if (daysLeft <= 7) {
      return 'Expiring';
    } else {
      return 'Valid';
    }
  }
  getStatusClass(validUntil: string): string {
    const status = this.getStatus(validUntil);
    switch (status) {
      case 'Expired':
        return 'text-danger font-bold';
      case 'Expiring':
        return 'text-warning font-bold';
      case 'Valid':
        return 'text-success font-bold';
      default:
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
      this.members = this.members.filter(m => m.id !== this.memberToDelete.id);
      this.memberToDelete = null;
      this.deleteDialogVisible = false;
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
      validUntil: this.calculateValidUntil('Monthly')
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
    };
  }

  
  saveMember() {
    const subscription = this.newMember.subscriptionType;
    const validUntil = this.newMember.validUntil;
  
    if (this.isEditMode && this.selectedMemberId != null) {
      // Editing existing member
      const index = this.members.findIndex(m => m.id === this.selectedMemberId);
      if (index !== -1) {
        const updatedMember = {
          ...this.newMember,
          id: this.selectedMemberId,
          validUntil: validUntil,
          subscriptionType: subscription
        };
        this.members[index] = updatedMember;
  
        // Trigger change detection
        this.members = [...this.members];
      }
    } else {
      // Adding new member
      const newId = this.members.length + 1;
      const memberToAdd = {
        id: newId,
        ...this.newMember,
        validUntil: validUntil,
        subscriptionType: subscription
      };
  
      this.members = [...this.members, memberToAdd];
    }
  
    this.addDialogVisible = false;
    this.resetOtpState(); // Reset form and flags
  }
  
  
  
}
