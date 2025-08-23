import { Component, OnInit } from '@angular/core';
import { MemberService } from '../services/member.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
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
// Hardcoded UPI IDs and display names for each gym
// Hardcode UPI IDs for each gym
// Gym UPI / Phone Map
// Gym UPI / Phone Map
// Gym UPI mapping
gymUpiMap: { [gymId: number]: { upi?: string; phone?: string; name: string } } = {
  1234: { 
    upi: 'vetrikanthan.b.2006@okhdfcbank', 
    phone: '9361701413',   // ignored
    name: 'vetrigym' 
  },
  679: { 
    upi: 'lakshmikanthan.b.2001-1@okhdfcbank', 
    phone: '9025275948',   // ignored
    // No UPI ID, phone is ignored
    name: 'fitgyms' 
  }
};


  defaultGymId: number | null = null;
  defaultGymName: string | null = null;

  members: any[] = [];
  rolesList: any[] = [];


// Dummy data for Revenue tab
totalRevenue: number = 125000;

// Dummy data for Top Gyms tab
topGyms = [
  { name: 'Gold Gym', revenue: 50000 },
  { name: 'Fitness First', revenue: 35000 },
  { name: 'Anytime Fitness', revenue: 25000 }
];

// Dummy data for Payments tab
recentPayments = [
  { user: 'John Doe', amount: 2000, date: '2025-08-20' },
  { user: 'Jane Smith', amount: 1500, date: '2025-08-21' },
  { user: 'Alex Johnson', amount: 1800, date: '2025-08-22' }
];
  totalMembers = 0;
  activeMembers = 0;
  expiredMembers = 0;
  newMembersThisMonth = 0;

  memberChartData: any;
  memberChartOptions: any;
  adminMembersMap: { [gymId: number]: any[] } = {};

  constructor(private authService: AuthService, private router: Router,private memberService: MemberService) {}

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
    if (this.userrole === 'superadmin') {
      this.memberService.getRoles().subscribe({
        next: (rolesData: any[]) => {
          this.rolesList = rolesData.map(r => ({
            roleId: r.RoleId,
            roleName: r.RoleName,
            userName: r.UserName,
            gymId: r.GymId,
            gymName: r.GymName,
            upiVpa: r.UpiVpa || 'demo@upi'
          }));
          this.memberService.getAllMembers().subscribe({
            next: (data: any[]) => this.processMembersSuperAdmin(data),
            error: (err) => console.error('Failed to fetch members:', err),
          });
        },
        error: err => console.error('Failed to fetch roles:', err)
      });
    } else if (this.userrole === 'admin') {
      this.memberService.getMembersByGym(this.defaultGymId!, this.defaultGymName!).subscribe({
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
        legend: { position: 'top', labels: { color: '#e0e0e0' } },
        title: { display: true, text: 'Members Joined per Month', color: '#e0e0e0' }
      }
    };
  }

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
        legend: { position: 'top', labels: { color: '#e0e0e0' } },
        title: { display: true, text: 'Members per Admin', color: '#e0e0e0' }
      }
    };

    // Map members to their gyms
    this.adminMembersMap = {};
    this.rolesList.forEach(role => {
      this.adminMembersMap[role.gymId] = this.members.filter(m => m.GymId === role.gymId);
    });
  }


// Generates real UPI QR code for admin (UPI ID only)
getUpiQrUrl(gymId: number, gymName: string): string {
  const gymInfo = this.gymUpiMap[gymId] || { 
    upi: '', 
    name: gymName 
  };

  const payeeAddress = gymInfo.upi?.trim();

  // If no UPI ID, use a default dummy UPI
  const finalPayeeAddress = payeeAddress || 'lakshmikanthan.b.2001-1@okhdfcbank';
  const payeeName = gymInfo.name || gymName;

  const upiString = `upi://pay?pa=${encodeURIComponent(finalPayeeAddress)}&pn=${encodeURIComponent(payeeName)}&tn=${encodeURIComponent('Gym Payment for ' + gymName)}&cu=INR`;

  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
}




}
