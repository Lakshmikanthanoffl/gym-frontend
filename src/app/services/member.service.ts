import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member } from '../models/member.model';
import { Role } from './auth.service';
import { environment } from '../../environments/environment';
export interface Payment {
  id?: number;
  PaymentId: number;
  userName: string;
  plan: string;
  price: number;
  paymentDate: string;
  screenshot: string;
  gymId: number;
  gymName: string;
}

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private apiUrl = `${environment.apiBaseUrl}/api/members`;
  private roleApiUrl = `${environment.apiBaseUrl}/api/Role`;
  private gymApiUrl = `${environment.apiBaseUrl}/api/role/bygym`;
  private apiUrlpayments = `${environment.apiBaseUrl}/api/Payment`;
  private emailApiUrl = `${environment.apiBaseUrl}/api/members/send-qr-email`;

  constructor(private http: HttpClient) {}

  // =========================
  // Payments
  // =========================

  // Get all payments (SuperAdmin)
  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrlpayments}/all`);
  }

  // Get payments by gymId & gymName (Admin)
  getPaymentsByGym(gymId: number, gymName: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrlpayments}/gym-payments`, {
      params: { gymId: gymId, gymName: gymName }
    });
  }

  // Add new payment
  addPayment(payment: FormData): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrlpayments}/save`, payment);
  }

  // Update existing payment
  updatePayment(paymentId: number, payment: FormData): Observable<Payment> {
    return this.http.put<Payment>(`${this.apiUrlpayments}/update/${paymentId}`, payment);
  }

  // Get single payment by id
  getPaymentById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrlpayments}/${id}`);
  }

  // Delete a payment
  deletePayment(paymentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlpayments}/${paymentId}`);
  }

  // =========================
  // Members
  // =========================

  getAllMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.apiUrl);
  }

  getAllrole(): Observable<Member[]> {
    return this.http.get<Member[]>(this.roleApiUrl);
  }

  getMemberById(id: number): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/${id}`);
  }

  addMember(member: Member): Observable<Member> {
    return this.http.post<Member>(this.apiUrl, member);
  }

  updateMember(member: Member): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${member.id}`, member);
  }

  deleteMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  sendQrEmail(payload: { 
    username: string,
    gymname: string,
    gymUserEmail: string,
    email: string,
    qrUrl: string
  }): Observable<any> {
  
    return this.http.post<any>(this.emailApiUrl, payload);
  }
  
  sendQrWhatsapp(payload: any) {
    return this.http.post(`${this.apiUrl}/send-whatsapp`, payload);
  }
  
  // =========================
  // Roles
  // =========================

  addRole(role: any): Observable<any> {
    return this.http.post<any>(this.roleApiUrl, role);
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(this.roleApiUrl);
  }

  getRoleById(roleId: number): Observable<any> {
    return this.http.get<any>(`${this.roleApiUrl}/${roleId}`);
  }

  updateRole(roleId: number, role: any): Observable<Role> {
    return this.http.put<Role>(`${this.roleApiUrl}/${roleId}`, role);
  }

  deleteRole(roleId: number): Observable<void> {
    return this.http.delete<void>(`${this.roleApiUrl}/${roleId}`);
  }

  // Get role(s) by email
getRolesByEmail(email: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.roleApiUrl}/email/${encodeURIComponent(email)}`);
}

  // =========================
  // Gym Info
  // =========================

  getDefaultGym(): Observable<{ gymId: number; gymName: string }> {
    return this.http.get<{ gymId: number; gymName: string }>(this.gymApiUrl);
  }

  getMembersByGym(gymId: number, gymName: string): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.apiUrl}/by-gym?gymId=${gymId}&gymName=${gymName}`);
  }
 
  markAttendance(id: number, date: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/attendance`, { date });
  }
  
  

  getAttendance(memberId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${memberId}/attendance`);
  }
}
