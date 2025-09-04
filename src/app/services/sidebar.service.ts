import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private sidebarState = new BehaviorSubject<boolean>(false);
  sidebarOpen$ = this.sidebarState.asObservable();

  toggleSidebar() {
    this.sidebarState.next(!this.sidebarState.value);
  }

  closeSidebar() {
    this.sidebarState.next(false);
  }

  openSidebar() {
    this.sidebarState.next(true);
  }
}
