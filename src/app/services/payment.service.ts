import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = 'https://gymmanagementapi.onrender.com/api/Payment';

  constructor(private http: HttpClient) {}

  // Create Razorpay order
  createOrder(amount: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create-order`, { Amount: amount });
  }

  // Verify Razorpay payment
  verifyPayment(data: { RazorpayOrderId: string, RazorpayPaymentId: string, RazorpaySignature: string,RoleId: number;Amount: number;PlanName:string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/verify-payment`, data);
  }
}
