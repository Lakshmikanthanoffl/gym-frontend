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
      subscriptionType: { label: 'Monthly', value: 'Monthly', period: '1 Month' },
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
      subscriptionType: { label: 'Quarterly', value: 'Quarterly', period: '3 Months' },
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
      subscriptionType: { label: 'Half-Yearly', value: 'Half-Yearly', period: '6 Months' },
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
      subscriptionType: { label: 'Yearly', value: 'Yearly', period: '12 Months' },
      period: '12 Months',
      amountPaid: 4800,
      paidDate: new Date('2025-01-01T08:15:00'),
      validUntil: new Date('2025-12-31'),
    },
    {
      id: 5,
      name: 'David Mathew',
      email: 'david.m@example.com',
      phone: '9811122233',
      subscriptionType: { label: 'Monthly', value: 'Monthly', period: '1 Month' },
      period: '1 Month',
      amountPaid: 550,
      paidDate: new Date('2025-08-01T11:20:00'),
      validUntil: new Date('2025-08-31'),
    }
  ];
  
  

  editDialogVisible = false;
  selectedMember: any = null;
  addDialogVisible = false;
  ngOnInit() {
   
  }
  viewMember(member: any) {
    this.selectedMember = member;
    this.editDialogVisible = true;
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
    const newId = this.members.length + 1;
  
    const subscription = this.newMember.subscriptionType;
    const validUntil = this.newMember.validUntil;
  
    const memberToAdd = {
      id: newId,
      ...this.newMember,
      validUntil: validUntil
    };
  
    // Use spread operator to trigger change detection
    this.members = [...this.members, memberToAdd];
    
    this.addDialogVisible = false;
    
  }
  
  
  
}
