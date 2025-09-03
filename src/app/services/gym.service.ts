import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GymService {
  private gyms = [
    { id: 1234, name: 'Vetrigym' },
    { id: 5678, name: 'Fitness Hub' },
    { id: 9101, name: 'Power Gym' }
  ];

  private currentGymSubject = new BehaviorSubject<string>('Zyct'); // default title
  currentGym$ = this.currentGymSubject.asObservable();

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    const gymId = Number(localStorage.getItem('GymId')) || 0;
    this.setGymById(gymId);
  }

  setGymById(gymId: number) {
    if (!gymId) {
      this.currentGymSubject.next('Zyct');
      localStorage.removeItem('GymId'); // cleanup on logout
      return;
    }
    const gym = this.gyms.find(g => g.id === gymId);
    this.currentGymSubject.next(gym ? gym.name : 'Zyct');
    localStorage.setItem('GymId', String(gymId));
  }

  logout() {
    this.setGymById(0); // reset to default
  }
  
}


