import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { GymService } from './services/gym.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.css']   // fixed plural form
})
export class AppComponent {
  title = 'gym-frontend';
  isMaintenanceMode: boolean = false;
  isLoginPage: boolean = false;   // <-- added

  constructor(
    private titleService: Title,
    private gymService: GymService,
    private router: Router         // <-- added
  ) {}

  ngOnInit() {
    // Subscribe to gym changes
    this.gymService.currentGym$.subscribe(gymName => {
      this.titleService.setTitle(gymName);
    });

    // Detect login route
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage = event.urlAfterRedirects === '/login';
      }
    });
  }
}
