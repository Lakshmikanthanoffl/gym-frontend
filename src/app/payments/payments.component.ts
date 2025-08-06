import { Component } from '@angular/core';

@Component({
  selector: 'app-payments',
  standalone: false,
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent {
  paymentRecords = [
    {
      userName: 'John Doe',
      plan: 'Monthly',
      price: 999,
      paymentDate: '2025-08-05 10:30 AM',
      screenshot: 'assets/screenshots/john.png'
    },
    {
      userName: 'Jane Smith',
      plan: 'Yearly',
      price: 8999,
      paymentDate: '2025-08-04 02:15 PM',
      screenshot: 'assets/screenshots/jane.png'
    },
    {
      userName: 'Raj Kumar',
      plan: 'Quarterly',
      price: 2499,
      paymentDate: '2025-08-03 11:00 AM',
      screenshot: 'assets/screenshots/raj.png'
    },
    {
      userName: 'Emily Johnson',
      plan: 'Monthly',
      price: 999,
      paymentDate: '2025-08-02 04:45 PM',
      screenshot: 'assets/screenshots/emily.png'
    },
    {
      userName: 'Mohammed Ali',
      plan: 'Yearly',
      price: 8999,
      paymentDate: '2025-08-01 09:10 AM',
      screenshot: 'assets/screenshots/ali.png'
    },
    {
      userName: 'Samantha Lee',
      plan: 'Quarterly',
      price: 2499,
      paymentDate: '2025-07-30 06:25 PM',
      screenshot: 'assets/screenshots/samantha.png'
    },
    {
      userName: 'Vikram Singh',
      plan: 'Monthly',
      price: 999,
      paymentDate: '2025-07-29 01:55 PM',
      screenshot: 'assets/screenshots/vikram.png'
    },
    {
      userName: 'Lily Parker',
      plan: 'Yearly',
      price: 8999,
      paymentDate: '2025-07-28 12:00 PM',
      screenshot: 'assets/screenshots/lily.png'
    },
    {
      userName: 'Anand Mehta',
      plan: 'Monthly',
      price: 999,
      paymentDate: '2025-07-27 10:10 AM',
      screenshot: 'assets/screenshots/anand.png'
    },
    {
      userName: 'Sophia Chen',
      plan: 'Quarterly',
      price: 2499,
      paymentDate: '2025-07-26 03:35 PM',
      screenshot: 'assets/screenshots/sophia.png'
    }
  ];
  // Filter inputs
  nameFilter: string = '';
  planFilter: string = '';
  dateFilter: string = '';
  get filteredPayments() {
    return this.paymentRecords.filter(record =>
      record.userName.toLowerCase().includes(this.nameFilter.toLowerCase()) &&
      record.plan.toLowerCase().includes(this.planFilter.toLowerCase()) &&
      record.paymentDate.toLowerCase().includes(this.dateFilter.toLowerCase())
    );
  }  
  openScreenshot(url: string): void {
    window.open(url, '_blank');
  }
  
}
