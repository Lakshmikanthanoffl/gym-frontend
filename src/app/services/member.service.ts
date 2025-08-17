import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member } from '../models/member.model';
import { Role } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private apiUrl = 'https://gymmanagementapi.onrender.com/api/members';
  private roleApiUrl = 'https://gymmanagementapi.onrender.com/api/Role';
  private gymApiUrl = 'https://gymmanagementapi.onrender.com/api/role/bygym';

  constructor(private http: HttpClient) {}

  // ✅ Members
  getAllMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.apiUrl);
  }
  // ✅ Members
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

  // ✅ Roles
  addRole(role: any): Observable<any> {
    return this.http.post<any>(this.roleApiUrl, role);
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(this.roleApiUrl);
  }

  // 🔹 NEW: Get Role by ID
  getRoleById(roleId: number): Observable<any> {
    return this.http.get<any>(`${this.roleApiUrl}/${roleId}`);
  }

  // member.service.ts
updateRole(roleId: number, role: any): Observable<Role> {
  return this.http.put<Role>(`${this.roleApiUrl}/${roleId}`, role);
}

  
  deleteRole(roleId: number): Observable<void> {
    return this.http.delete<void>(`${this.roleApiUrl}/${roleId}`);
  }
  // ✅ Gym Info
  getDefaultGym(): Observable<{ gymId: number; gymName: string }> {
    return this.http.get<{ gymId: number; gymName: string }>(this.gymApiUrl);
  }

  getMembersByGym(gymId: number, gymName: string): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.apiUrl}/by-gym?gymId=${gymId}&gymName=${gymName}`);
  }
}
