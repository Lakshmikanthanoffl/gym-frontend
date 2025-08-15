import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member } from '../models/member.model';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  // private apiUrl = 'https://gymmanagementapi-production-offl.up.railway.app/api/members';
  private apiUrl = 'https://gymmanagementapi-production-offl.up.railway.app/api/members';
  private gymApiUrl = 'https://gymmanagementapi-production-offl.up.railway.app/api/role/bygym';
  constructor(private http: HttpClient) {}

  getAllMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.apiUrl);
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
   // ✅ New method to get default gym info
   getDefaultGym(): Observable<{ gymId: number; gymName: string }> {
    return this.http.get<{ gymId: number; gymName: string }>(this.gymApiUrl);
  }
  // ✅ New method to fetch members by GymId and GymName
  getMembersByGym(gymId: number, gymName: string): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.apiUrl}/by-gym?gymId=${gymId}&gymName=${gymName}`);
  }
}
