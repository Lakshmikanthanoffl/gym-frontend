import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { GymService } from './services/gym.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'gym-frontend';
  isMaintenanceMode: boolean = false;
  
  constructor(
    private titleService: Title,
    private gymService: GymService
  ) {}

  ngOnInit() {
     // Subscribe to gym changes
     this.gymService.currentGym$.subscribe(gymName => {
      this.titleService.setTitle(gymName);
    });
    
  }
  }

