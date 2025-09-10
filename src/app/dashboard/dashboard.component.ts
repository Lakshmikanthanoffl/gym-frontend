import { Component, OnInit, ViewChild } from '@angular/core';
import { MemberService } from '../services/member.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { interval, Subscription } from 'rxjs';
import { ThemeService } from '../services/theme.service';
import type { Chart } from 'chart.js';

;

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('memberChart') memberChartRef: any; // template ref


  userrole: any;
  isAdmin: boolean = false;
  isSuperAdmin!: boolean;
  isAdminOrSuperAdmin!: boolean;
 

  // Hardcoded UPI IDs and display names for each gym
  gymUpiMap: { [gymId: number]: { upi?: string; phone?: string; name: string } } = {
    1234: { upi: 'vetrikanthan.b.2006@okhdfcbank', phone: '9361701413', name: 'vetrigym' },
    679: { upi: 'lakshmikanthan.b.2001-1@okhdfcbank', phone: '9025275948', name: 'fitgyms' }
  };

  defaultGymId: number | null = null;
  defaultGymName: string | null = null;

  members: any[] = [];
  rolesList: any[] = [];

  totalRevenue: number = 125000;
  topGyms = [
    { name: 'Gold Gym', revenue: 50000 },
    { name: 'Fitness First', revenue: 35000 },
    { name: 'Anytime Fitness', revenue: 25000 }
  ];

  recentPayments = [
    { user: 'John Doe', amount: 2000, date: '2025-08-20' },
    { user: 'Jane Smith', amount: 1500, date: '2025-08-21' },
    { user: 'Alex Johnson', amount: 1800, date: '2025-08-22' }
  ];

  totalMembers = 0;
  activeMembers = 0;
  expiredMembers = 0;
  newMembersThisMonth = 0;
  statusCheckSub!: Subscription;
  timerSubscription!: Subscription;
  memberChartData: any;
  memberChartOptions: any;
  adminMembersMap: { [gymId: number]: any[] } = {};

  constructor(
    private authService: AuthService,
    private router: Router,
    private memberService: MemberService,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.themeService.theme$.subscribe(theme => {
      this.updateMemberChartColors(theme === 'dark');
    });
    this.defaultGymName = localStorage.getItem('GymName') ?? '';
    this.defaultGymId = Number(localStorage.getItem('GymId')) || 0;
    this.userrole = localStorage.getItem("role");
    this.isAdmin = this.userrole === 'admin';
    this.isSuperAdmin = this.userrole === 'superadmin';
    this.isAdminOrSuperAdmin = this.isAdmin || this.isSuperAdmin;
  
    this.fetchMembersFromAPI();
  
    // Automatically update subscription status every 1 minute
    this.statusCheckSub = interval(1000).subscribe(() => {
      // Just trigger Angular change detection by reassigning members
      this.rolesList = [...this.rolesList];
    });
    this.timerSubscription = interval(1000).subscribe(() => {
      this.updateCountdowns();
    });
  }
  get expiredAdminsCount(): number {
    return this.rolesList?.filter(r => r.status?.toLowerCase() === 'expired').length || 0;
  }
  
  updateCountdowns() {
    const now = new Date();
  
    this.rolesList.forEach(role => {
      const validUntil = new Date(role.validUntil);
      const diff = validUntil.getTime() - now.getTime(); // difference in ms
  
      if (diff <= 0) {
        role.countdown = 'Expired';
        role.statusColor = 'red';
        role.status = 'Expired';
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
  
        role.countdown = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  
        if (days === 0) {
          role.status = 'Expiring Today';
          role.statusColor = 'orange';
        } else {
          role.status = 'Active';
          role.statusColor = 'green';
        }
      }
    });
  }
  
  updateMemberChartColors(isDark: boolean) {
    const chartComponent = this.memberChartRef;
    if (!chartComponent) return;
  
    const chart: Chart = chartComponent.chart; // actual Chart.js instance
  
    chart.data.datasets[0].backgroundColor = isDark ? '#5bc0de' : '#f0ad4e';
  
    chart.options.plugins!.legend!.labels!.color = isDark ? '#e0e0e0' : '#222';
    chart.options.plugins!.title!.color = isDark ? '#e0e0e0' : '#222';
    chart.options.plugins!.tooltip!.backgroundColor = isDark ? '#2a2a2a' : '#f5f5f5';
    chart.options.plugins!.tooltip!.titleColor = isDark ? '#fff' : '#000';
    chart.options.plugins!.tooltip!.bodyColor = isDark ? '#e0e0e0' : '#222';
  
    // Use bracket notation for scales
    chart.options.scales!['x']!.ticks!.color = isDark ? '#e0e0e0' : '#222';
    chart.options.scales!['x']!.grid!.color = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    chart.options.scales!['y']!.ticks!.color = isDark ? '#e0e0e0' : '#222';
    chart.options.scales!['y']!.grid!.color = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  
    chart.update();
  }
  
  
  
  
  goToAdminOnboard() {
    this.router.navigate(['/admin-onboard']);
  }
  ngOnDestroy() {
    if (this.statusCheckSub) {
      this.statusCheckSub.unsubscribe();
    }
  }

  fetchMembersFromAPI() {
    const now = new Date();
    if (this.userrole === 'superadmin') {
      this.memberService.getRoles().subscribe({
        next: (rolesData: any[]) => {
          this.rolesList = rolesData.map(r => ({
            PaidDate:r.PaidDate,
            roleId: r.RoleId,
            roleName: r.RoleName,
            userName: r.UserName,
            gymId: r.GymId,
            gymName: r.GymName,
            validUntil: r.ValidUntil ? new Date(r.ValidUntil) : null
          }));
          this.newMembersThisMonth = this.rolesList.filter(m => {
            const joined = new Date(m.PaidDate);
            return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
          }).length;
      
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
    const isDark = this.themeService.isDarkMode();
  console.log("isdark",isDark)
    // Member counts
    this.totalMembers = this.members.length;
    this.activeMembers = this.members.filter(m => new Date(m.ValidUntil) >= now).length;
    this.expiredMembers = this.members.filter(m => new Date(m.ValidUntil) < now).length;
    this.newMembersThisMonth = this.members.filter(m => {
      const joined = new Date(m.PaidDate);
      return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
    }).length;
  
    // Monthly data
    const monthCounts = Array(12).fill(0);
    this.members.forEach(member => {
      const paidDate = new Date(member.PaidDate);
      monthCounts[paidDate.getMonth()]++;
    });
  
    // Chart data
    this.memberChartData = {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [
        {
          label: 'Members Joined',
          data: monthCounts,
          backgroundColor: isDark ? '#5bc0de' : '#f0ad4e', // bar color based on theme
          borderRadius: 6
        }
      ]
    };
  
    // Chart options
    this.memberChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: isDark ? '#e0e0e0' : '#222', font: { weight: '600' } }
        },
        title: {
          display: true,
          text: 'Members Joined per Month',
          color: isDark ? '#e0e0e0' : '#222',
          font: { size: 16, weight: '600' }
        },
        tooltip: {
          backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
          titleColor: isDark ? '#fff' : '#000',
          bodyColor: isDark ? '#e0e0e0' : '#222'
        }
      },
      scales: {
        x: {
          ticks: { color: isDark ? '#e0e0e0' : '#222' },
          grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
        },
        y: {
          ticks: { color: isDark ? '#e0e0e0' : '#222' },
          grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
        }
      }
    };
  }
  

  processMembersSuperAdmin(data: any[]) {
    this.members = data || [];
    const now = new Date();

    this.totalMembers = this.members.length;
    this.activeMembers = this.members.filter(m => new Date(m.ValidUntil) >= now).length;
    this.expiredMembers = this.members.filter(m => new Date(m.ValidUntil) < now).length;
    
    const labels = this.rolesList.map(r => r.userName);
    const counts = this.rolesList.map(r => this.members.filter(m => m.GymId === r.gymId).length);

    this.memberChartData = {
      labels,
      datasets: [{ label: 'Members per Admin', data: counts, backgroundColor: '#42A5F5' }]
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

  
// Check subscription status
isValid(date: string | Date): boolean {
  const today = new Date();
  return new Date(date) >= today;
}
// Check if subscription is expired
isExpired(date: string | Date): boolean {
  const today = new Date();
  return new Date(date) < today;
}

// Check if expiring today
isExpiringToday(date: string | Date): boolean {
  const today = new Date();
  const expiry = new Date(date);
  return !this.isExpired(date) &&
         expiry.getFullYear() === today.getFullYear() &&
         expiry.getMonth() === today.getMonth() &&
         expiry.getDate() === today.getDate();
}

// Check if expiring soon (next 7 days, excluding today)
isExpiringSoon(date: string | Date): boolean {
  const today = new Date();
  const expiry = new Date(date);
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 7;
}

// Get status text
getStatusText(date: string | Date): string {
  if (this.isExpired(date)) return 'Expired';
  if (this.isExpiringToday(date)) return 'Expiring Today';
  if (this.isExpiringSoon(date)) return 'Expiring Soon';
  return 'Active';
}

// Get status color
getStatusColor(date: string | Date): string {
  if (this.isExpired(date)) return '#FF4C4C';       // Red
  if (this.isExpiringToday(date)) return '#FFA500'; // Orange
  if (this.isExpiringSoon(date)) return '#FFD700';  // Gold
  return '#32CD32';                                  // Green
}

// Get row class for highlighting
getRowClass(date: string | Date): string {
  if (this.isExpired(date)) return 'expired';
  if (this.isExpiringToday(date)) return 'expiring-today';
  if (this.isExpiringSoon(date)) return 'expiring-soon';
  return '';
}

  // Generate UPI QR code for admin or gym
  getUpiQrUrl(gymId: number, gymName: string): string {
    const gymInfo = this.gymUpiMap[gymId] || { upi: '', name: gymName };
    const finalPayeeAddress = gymInfo.upi?.trim() || 'lakshmikanthan.b.2001-1@okhdfcbank';
    const payeeName = gymInfo.name || gymName;

    const upiString = `upi://pay?pa=${encodeURIComponent(finalPayeeAddress)}&pn=${encodeURIComponent(payeeName)}&tn=${encodeURIComponent('Gym Payment for ' + gymName)}&cu=INR`;

    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
  }
}
