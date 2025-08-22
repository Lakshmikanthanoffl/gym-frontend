import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MemberService, Payment } from '../services/member.service';
import { AuthService } from '../services/auth.service';
import { finalize } from 'rxjs/operators';
interface SubscriptionOption {
  label: string;
  value: string;
  period: string;
  price: number;
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
  globalFilter: string = '';
  availableGyms: { id: number; name: string }[] = [];
  userrole: string | null = null;
  gymId!: number;
  gymName!: string;
  selectedPaymentId: number | null = null;
  isEditMode: boolean = false; // <-- new 

  subscriptionTypes: SubscriptionOption[] = [
    { label: 'Monthly', value: 'Monthly', period: '1 Month', price: 600 },
    { label: 'Quarterly', value: 'Quarterly', period: '3 Months', price: 1500 },
    { label: 'Half-Yearly', value: 'Half-Yearly', period: '6 Months', price: 3200 },
    { label: 'Yearly', value: 'Yearly', period: '12 Months', price: 6000 }
  ];
  // Add Payment popup
  showAddDialog = false;
  paymentForm!: FormGroup;
  selectedFile: File | null = null;

  // Delete popup
  deleteDialogVisible = false;
  paymentToDelete: Payment | null = null;
  deleteConfirmationText: string = '';

  constructor(
    private paymentService: MemberService,
    private authService: AuthService,
    private fb: FormBuilder
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
  onPlanChange(selectedValue: string) {
    const subscription = this.subscriptionTypes.find(s => s.value === selectedValue);
    if (subscription) {
      this.paymentForm.patchValue({ 
        plan: subscription.value,   // stores the plan name
        price: subscription.price   // automatically updates the price
      });
    }
  }
  openEditPaymentDialog(payment: Payment) {
    this.showAddDialog = true;
    this.isEditMode = true; // Edit mode
    this.selectedPaymentId = payment.PaymentId;
    this.selectedFile = null; // reset file
    // Pre-fill the form
    this.paymentForm.patchValue({
      userName: payment.userName,
      plan: payment.plan,
      price: payment.price,
      paymentDate: new Date(payment.paymentDate),
      gymId: payment.gymId,
      gymName: payment.gymName
    });
  
    this.selectedFile = null; // reset file
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
    formData.append('userName', this.paymentForm.get('userName')?.value);
    formData.append('plan', this.paymentForm.get('plan')?.value);
    formData.append('price', this.paymentForm.get('price')?.value);
  
    const rawDate = this.paymentForm.get('paymentDate')?.value;
    if (rawDate) {
      formData.append('paymentDate', new Date(rawDate).toISOString());
    }
  
    formData.append('gymId', this.paymentForm.get('gymId')?.value);
    formData.append('gymName', this.paymentForm.get('gymName')?.value);
  
    if (this.selectedFile) {
      formData.append('screenshotFile', this.selectedFile);
    }
  
    if (this.selectedPaymentId) {
      // Edit mode -> PUT request
      this.paymentService.updatePayment(this.selectedPaymentId, formData).subscribe({
        next: () => {
          this.showAddDialog = false;
          this.selectedPaymentId = null;
          this.loadPayments();
        },
        error: (err) => console.error('Error updating payment', err)
      });
    } else {
      // Add mode -> POST request
      this.paymentService.addPayment(formData).subscribe({
        next: () => {
          this.showAddDialog = false;
          this.loadPayments();
        },
        error: (err) => console.error('Error saving payment', err)
      });
    }
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
      },
      error: (err) => console.error('Error deleting payment', err)
    });
  }
}
