import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MemberService, Payment } from '../services/member.service';
import { AuthService } from '../services/auth.service';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Member } from '../models/member.model';
export interface SubscriptionOption {
  label: string;
  value: string;
  period: string;
  price: number;
  gymId?: number;
}
@Component({
  selector: 'app-payments',
  standalone: false,
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  paymentRecords: Payment[] = [];
  loading: boolean = false;
  // For autocomplete search
filteredMemberSuggestions: any[] = [];

  globalFilter: string = '';
  availableGyms: { id: number; name: string }[] = [];
  userrole: string | null = null;
  gymId!: number;
  gymName!: string;
  selectedPaymentId: number | null = null;
  isEditMode: boolean = false; // <-- new 
  members: Member[] = [];
  filteredMembers: Member[] = [];
  subscriptionTypes: SubscriptionOption[] = [
    //here we can add the all the subscriptions based on the gyms ( gyms id )

    // for super admin it will show all the things and mapped correspondingly 

    
    { label: 'Monthly', value: 'Monthly', period: '1 Month', price: 500, gymId: 679 },
    { label: 'Quarterly', value: 'Quarterly', period: '3 Months', price: 1500, gymId: 679 },
    { label: 'Half-Yearly', value: 'Half-Yearly', period: '6 Months', price: 3200, gymId: 679 },
    { label: 'Yearly', value: 'Yearly', period: '12 Months', price: 6000, gymId: 679 },
  
    { label: 'Monthly', value: 'Monthly', period: '1 Month', price: 500, gymId: 6 },
    { label: 'Quarterly', value: 'Quarterly', period: '3 Months', price: 1500, gymId: 6 },
    { label: 'Half-Yearly', value: 'Half-Yearly', period: '6 Months', price: 3200, gymId: 6 },
    { label: 'Yearly', value: 'Yearly', period: '12 Months', price: 6000, gymId: 6 },

    { label: 'Monthly', value: 'Monthly', period: '1 Month', price: 500, gymId: 356 },
    { label: 'Quarterly', value: 'Quarterly', period: '3 Months', price: 1500, gymId: 356 },
    { label: 'Half-Yearly', value: 'Half-Yearly', period: '6 Months', price: 3200, gymId: 356 },
    { label: 'Yearly', value: 'Yearly', period: '12 Months', price: 6000, gymId: 356 },


    { label: 'Monthly', value: 'Monthly', period: '1 Month', price: 500, gymId: 1106 },

    { label: 'Monthly', value: 'Monthly', period: '1 Month', price: 800, gymId: 1234 },
    { label: 'Quarterly', value: 'Quarterly', period: '3 Months', price: 2000, gymId: 1234 },
    { label: 'Yearly', value: 'Yearly', period: '12 Months', price: 7000, gymId: 1234 },

    { label: 'Monthly', value: 'Monthly', period: '1 Month', price: 700, gymId: 89 },
    { label: 'Quarterly', value: 'Quarterly', period: '3 Months', price: 2000, gymId: 89 },
    { label: 'Yearly', value: 'Yearly', period: '12 Months', price: 7000, gymId: 89 }
  ];
  
  // Add Payment popup
  showAddDialog = false;
  paymentForm!: FormGroup;
  selectedFile: File | null = null;
  selectedMember: any = null;
  // Delete popup
  deleteDialogVisible = false;
  paymentToDelete: Payment | null = null;
  deleteConfirmationText: string = '';
  filteredSubscriptionTypes: SubscriptionOption[] = [];
  constructor(
    private paymentService: MemberService,
    private authService: AuthService,
    private fb: FormBuilder,private memberService: MemberService
  ) {}

  ngOnInit(): void {
    this.userrole = localStorage.getItem('role');
    this.gymId = Number(localStorage.getItem('GymId')) || 0;
    this.gymName = localStorage.getItem('GymName') ?? '';

    this.paymentForm = this.fb.group({
      userName: [''],
      plan: [''],
      price: [0],
      paymentDate: [new Date()],  // <-- sets today's date by default
      gymId: [this.gymId],
      gymName: [this.gymName]
    });
    

    this.loadPayments();
    this.getgymname();
    this.loadSubscriptions(this.gymId , this.userrole == "superadmin");
    this.fetchMembersFromAPI();
  }
// Called when typing in the input
searchMembers(event: any) {
  const query = event.query.toLowerCase();
  this.filteredMemberSuggestions = this.filteredMembers.filter(member =>
    member.name.toLowerCase().includes(query)
  );
}
  fetchMembersFromAPI() {
    const userRole = this.userrole; // e.g., 'superadmin' or 'admin'
    const gymId =  this.gymId ;       // set this if admin
    const gymName = this.gymName;   // set this if admin
  
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
      attendance: m.Attendance || []   // ✅ Keep attendance from backend
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
// Load subscriptions based on gym
loadSubscriptions(gymId: number, isSuperAdmin: boolean = false) {
  if (isSuperAdmin) {
    this.filteredSubscriptionTypes = [...this.subscriptionTypes];
  } else {
    this.filteredSubscriptionTypes = this.subscriptionTypes.filter(s => s.gymId === gymId);
  }

  // Select first plan by default if exists
  if (this.filteredSubscriptionTypes.length > 0) {
    this.onPlanChange(this.filteredSubscriptionTypes[0].value);
  }
}

  loadPayments(): void {
    this.loading = true;

    if (this.userrole === 'superadmin') {
      this.paymentService.getAllPayments()
        .pipe(finalize(() => this.loading = false))
        .subscribe(payments => {
          this.paymentRecords = payments.map(p => this.mapPayment(p));
        });
    } else if (this.userrole === 'admin') {
      this.paymentService.getPaymentsByGym(this.gymId, this.gymName)
        .pipe(finalize(() => this.loading = false))
        .subscribe(payments => {
          this.paymentRecords = payments.map(p => this.mapPayment(p));
        });
    } else {
      this.loading = false;
    }
  }

  private mapPayment(p: any): Payment {
    return {
      PaymentId: p.PaymentId,
      userName: p.UserName,
      plan: p.Plan,
      price: p.Price,
      paymentDate: p.PaymentDate,
      gymId: p.GymId,
      gymName: p.GymName,
      screenshot: p.Screenshot
    };
  }
// Triggered on plan selection
onPlanChange(selectedValue: string) {
  const subscription = this.filteredSubscriptionTypes.find(s => s.value === selectedValue);
  if (subscription) {
    this.paymentForm.patchValue({
      plan: subscription.value,
      price: subscription.price,
      period: subscription.period // optional
    });
  }
}

  openEditPaymentDialog(payment: Payment) {
  this.showAddDialog = true;
  this.isEditMode = true;
  this.selectedPaymentId = payment.PaymentId;

  // Reset file
  this.selectedFile = null;

  // Find the member object from your members list (if needed)
  const memberObj = this.members.find(m => m.id === payment.id);

  this.paymentForm.patchValue({
    userName: memberObj || { id: 0, name: payment.userName }, // store full object
    plan: payment.plan,
    price: payment.price,
    paymentDate: new Date(payment.paymentDate),
    gymId: payment.gymId,
    gymName: payment.gymName
  });
}

  
  get filteredPayments(): Payment[] {
    const search = (this.globalFilter ?? '').toLowerCase();
    return this.paymentRecords.filter(record =>
      (record.userName ?? '').toLowerCase().includes(search) ||
      (record.plan ?? '').toLowerCase().includes(search) ||
      (record.paymentDate ? (new Date(record.paymentDate)).toLocaleDateString() : '').toLowerCase().includes(search) ||
      (record.price ?? 0).toString().includes(search) ||
      (record.gymName ?? '').toLowerCase().includes(search) ||
      (record.gymId ?? 0).toString().includes(search)
    );
  }

  openScreenshot(url: string): void {
    window.open(url, '_blank');
  }

  // Add Payment
  openAddPaymentDialog() {
    this.showAddDialog = true;
    this.isEditMode = false; // Add mode
    this.paymentForm.reset({
      userName: '',
      plan: '',
      price: 0,
      paymentDate: new Date(), // <-- sets today’s date
      gymId: this.gymId,
      gymName: this.gymName
    });
    this.selectedFile = null;
  }
  
  onMemberSelect(event: any) {
    const member = event.value;
    if (!member) return;
  
    this.paymentForm.patchValue({
      userName: member,  // <-- store full object here
      plan: member.subscriptionType?.value || '',
      price: member.subscriptionType?.price || 0,
      paymentDate: member.paidDate ? new Date(member.paidDate) : new Date(),
      gymId: member.gymId,
      gymName: member.gymName
    });
  
    if (this.userrole === 'superadmin') {
      this.onGymChange(member.gymId);
    }
  
    this.selectedMember = member;
  }
  
  
  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }
  getgymname(){
    if (this.userrole === 'superadmin') {
      this.paymentService.getAllrole().subscribe({
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
      this.gymId = gym.id;
      this.gymName = gym.name;
    }
  }
  savePayment() {
    const formData = new FormData();
  
    const selectedMember = this.paymentForm.get('userName')?.value;
    if (selectedMember) {
      // If using object from autocomplete
      formData.append('userName', selectedMember.name ?? ''); // send name
      formData.append('userId', selectedMember.id?.toString() ?? ''); // optional: send id
    } else {
      formData.append('userName', '');
    }
  
    formData.append('plan', this.paymentForm.get('plan')?.value ?? '');
    formData.append('price', this.paymentForm.get('price')?.value ?? 0);
  
    const rawDate = this.paymentForm.get('paymentDate')?.value;
    if (rawDate) {
      formData.append('paymentDate', new Date(rawDate).toISOString());
    }
  
    formData.append('gymId', this.gymId.toString());
    formData.append('gymName', this.gymName);
  
    if (this.selectedFile) {
      formData.append('screenshotFile', this.selectedFile);
    }
  
    const saveObservable = this.selectedPaymentId
      ? this.paymentService.updatePayment(this.selectedPaymentId, formData)
      : this.paymentService.addPayment(formData);
  
    saveObservable.subscribe({
      next: () => {
        this.showAddDialog = false;
        this.loadPayments();
        Swal.fire({
          icon: 'success',
          title: this.isEditMode ? 'Payment Updated!' : 'Payment Added!',
          text: 'Operation completed successfully.',
          background: '#1e1e1e',
          color: '#f5f5f5',
          confirmButtonColor: '#00b894',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      },
      error: (err) => {
        let messages: string[] = [];
        if (err.error?.errors) {
          messages = Object.values(err.error.errors)
            .flat()
            .map(e => String(e));
        } else if (err.error?.title) {
          messages = [err.error.title];
        } else {
          messages = ['An unexpected error occurred.'];
        }
  
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          html: messages.join('<br>'),
          background: '#1e1e1e',
          color: '#f5f5f5',
          confirmButtonColor: '#d63031',
          customClass: { popup: 'swal2-popup-front' }
        });
      }
    });
  }
  
  
  

  // Delete Payment
  openDeleteDialog(payment: Payment) {
    this.paymentToDelete = payment;
    this.deleteConfirmationText = '';
    this.deleteDialogVisible = true;
  }

  confirmDeletePayment() {
    if (!this.paymentToDelete) return;
  
    this.paymentService.deletePayment(this.paymentToDelete.PaymentId).subscribe({
      next: () => {
        this.loadPayments();
        this.deleteDialogVisible = false;
        this.paymentToDelete = null;
        this.deleteConfirmationText = '';
  
        // ✅ Success popup
        Swal.fire({
          icon: 'success',
          title: 'Payment Deleted!',
          text: 'The payment has been deleted successfully.',
          background: '#1e1e1e',
          color: '#f5f5f5',
          confirmButtonColor: '#00b894',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      },
      error: (err) => {
        let messages: string[] = [];
  
        if (err.error?.errors) {
          messages = Object.values(err.error.errors)
            .flat()
            .map(e => String(e));
        } else if (err.error?.title) {
          messages = [err.error.title];
        } else {
          messages = ['An unexpected error occurred while deleting the payment.'];
        }
  
        // ❌ Error popup
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          html: messages.join('<br>'),
          background: '#1e1e1e',
          color: '#f5f5f5',
          confirmButtonColor: '#d63031',
          customClass: {
            popup: 'swal2-popup-front'
          }
        });
      }
    });
  }
  
}
