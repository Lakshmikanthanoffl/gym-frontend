import { Component, OnInit } from '@angular/core';
import { MemberService, Payment } from '../services/member.service';
import { AuthService } from '../services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-payments',
  standalone: false,
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  paymentRecords: Payment[] = [];
  nameFilter: string = '';
  planFilter: string = '';
  dateFilter: string = '';
  gymFilter: string = '';
gymIdFilter: string = '';
globalFilter: string = '';


  loading: boolean = false;

  userrole: string | null = null;
  gymId!: number;
  gymName!: string;

  constructor(
    private paymentService: MemberService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userrole = localStorage.getItem('role');
    this.gymId = Number(localStorage.getItem('GymId')) || 0;
    this.gymName = localStorage.getItem('GymName') ?? '';

    this.loadPayments();
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

  // Map API response to camelCase
  private mapPayment(p: any): Payment {
    return {
      userName: p.UserName,
      plan: p.Plan,
      price: p.Price,
      paymentDate: p.PaymentDate,
      gymId: p.GymId,
      gymName: p.GymName,
      screenshot: p.Screenshot
    };
  }

  get filteredPayments(): Payment[] {
    const search = (this.globalFilter ?? '').toLowerCase(); // single search box
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
}
