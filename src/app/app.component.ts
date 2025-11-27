import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { GymService } from './services/gym.service';
import { environment } from '../../src/environments/environment';
declare let gtag: Function;
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
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        gtag('config', 'G-32ZXF3XQVQ', {
          'page_path': event.urlAfterRedirects
        });
      }
    });
  }

  ngOnInit() {
    console.log('✅ Current Environment:', environment.production ? 'Production' : 'Development');
    console.log('🌐 API Base URL:', environment.apiBaseUrl);
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
