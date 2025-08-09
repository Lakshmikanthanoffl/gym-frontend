import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  userrole: any;
  isAdmin: boolean=false;
  constructor() {}


  totalMembers = 6;
  activeMembers = 95;
  expiredMembers = 25;
  newMembersThisMonth = 10;

  memberChartData: any;
  memberChartOptions: any;

  ngOnInit() {
    this.userrole = localStorage.getItem("role")
    this.isAdmin = this.userrole === 'admin';
    console.log("this.userrole",this.userrole)
    this.memberChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [
        {
          label: 'New Members',
          data: [5, 8, 10, 12, 6, 14, 9],
          backgroundColor: '#42A5F5'
        }
      ]
    };

    this.memberChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Monthly New Members'
        }
      }
    };
  }
  
}
