import { Component, OnInit } from '@angular/core';
import { MemberService } from '../services/member.service'; // make sure this exists

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'] // fixed typo: styleUrl → styleUrls
})
export class DashboardComponent implements OnInit {
  userrole: any;
  isAdmin: boolean = false;
  isSuperAdmin!: boolean;
  isAdminOrSuperAdmin!: boolean;
  adminMemberCounts: { [gymId: number]: number } = {};
  defaultGymId: number | null = null;    // for admin
  defaultGymName: string | null = null;  // for admin

  members: any[] = [];       // store fetched members
  rolesList: any[] = [];     // store fetched admins

  totalMembers = 0;
  activeMembers = 0;
  expiredMembers = 0;
  newMembersThisMonth = 0;

  memberChartData: any;
  memberChartOptions: any;
  adminMembersMap: { [gymId: number]: any[] } = {}; // gymId -> array of members
  constructor(private memberService: MemberService) {}

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
      // Fetch admins first
      this.memberService.getRoles().subscribe({
        next: (rolesData: any[]) => {
          this.rolesList = rolesData.map(r => ({
            roleId: r.RoleId,
            roleName: r.RoleName,
            userName: r.UserName,
            gymId: r.GymId,
            gymName: r.GymName
          }));

          // Then fetch all members
          this.memberService.getAllMembers().subscribe({
            next: (data: any[]) => this.processMembersSuperAdmin(data),
            error: (err) => console.error('Failed to fetch members:', err),
          });
        },
        error: err => console.error('Failed to fetch roles:', err)
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
    const monthCounts = Array(12).fill(0);
    this.members.forEach(member => {
      const paidDate = new Date(member.PaidDate);
      monthCounts[paidDate.getMonth()]++;
    });

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

  // Superadmin: process members and map to admins
  processMembersSuperAdmin(data: any[]) {
    this.members = data || [];

    const now = new Date();
    this.totalMembers = this.members.length;
    this.activeMembers = this.members.filter(m => new Date(m.ValidUntil) >= now).length;
    this.expiredMembers = this.members.filter(m => new Date(m.ValidUntil) < now).length;
    this.newMembersThisMonth = this.members.filter(m => {
      const joined = new Date(m.PaidDate);
      return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
    }).length;

    // Chart: members per admin
    const labels = this.rolesList.map(r => r.userName);
    const counts = this.rolesList.map(r => this.members.filter(m => m.GymId === r.gymId).length);

    this.memberChartData = {
      labels,
      datasets: [
        {
          label: 'Members per Admin',
          data: counts,
          backgroundColor: '#42A5F5'
        }
      ]
    };

    this.memberChartOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Members per Admin' }
      }
    };
    // Map each admin's gymId to member count
// Map each admin's gymId to their members
this.adminMembersMap = {};
this.rolesList.forEach(role => {
  this.adminMembersMap[role.gymId] = this.members.filter(m => m.GymId === role.gymId);
});

  }
}
