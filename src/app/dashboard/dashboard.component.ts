import { Component, OnInit } from '@angular/core';
import { MemberService } from '../services/member.service'; // make sure this exists

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  userrole: any;
  isAdmin: boolean=false;
  isSuperAdmin!: boolean;
  isAdminOrSuperAdmin!: boolean;
  
  defaultGymId: number | null = null;    // for admin
  defaultGymName: string | null = null;  // for admin

  members: any[] = []; // store fetched members
  constructor(private memberService: MemberService) {}


  totalMembers = 0;
  activeMembers = 0;
  expiredMembers = 0;
  newMembersThisMonth = 0;

  memberChartData: any;
  memberChartOptions: any;

  ngOnInit() {
    this.defaultGymName = localStorage.getItem('GymName') ?? '';
    this.defaultGymId = Number(localStorage.getItem('GymId')) || 0;
    this.userrole = localStorage.getItem("role");
    this.isAdmin = this.userrole === 'admin';
    this.isSuperAdmin = this.userrole === 'superadmin';
    this.isAdminOrSuperAdmin = this.isAdmin || this.isSuperAdmin;

    this.fetchMembersFromAPI();
  }
  fetchMembersFromAPI() {
    const userRole = this.userrole;
    const gymId = this.defaultGymId;
    const gymName = this.defaultGymName;

    if (userRole === 'superadmin') {
      this.memberService.getAllMembers().subscribe({
        next: (data: any[]) => this.processMembers(data),
        error: (err) => console.error('Failed to fetch members:', err),
      });
    } else if (userRole === 'admin') {
      this.memberService.getMembersByGym(gymId!, gymName!).subscribe({
        next: (data: any[]) => this.processMembers(data),
        error: (err) => console.error('Failed to fetch members:', err),
      });
    }
  }

  processMembers(data: any[]) {
    this.members = data || [];
  
    const now = new Date();
    this.totalMembers = this.members.length;
    this.activeMembers = this.members.filter(m => new Date(m.ValidUntil) >= now).length;
    this.expiredMembers = this.members.filter(m => new Date(m.ValidUntil) < now).length;
    this.newMembersThisMonth = this.members.filter(m => {
      const joined = new Date(m.PaidDate);
      return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
    }).length;
  
    // Count members joined in each month
    const monthCounts = Array(12).fill(0); // Jan=0, Feb=1, ...
    this.members.forEach(member => {
      const paidDate = new Date(member.PaidDate);
      const month = paidDate.getMonth();
      monthCounts[month]++;
    });
  
    // Bind to chart
    this.memberChartData = {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [
        {
          label: 'Members Joined',
          data: monthCounts,
          backgroundColor: '#42A5F5'
        }
      ]
    };
  
    this.memberChartOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Members Joined per Month' }
      }
    };
  }
  
  
}
