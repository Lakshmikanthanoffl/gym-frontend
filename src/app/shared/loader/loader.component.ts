import { Component } from '@angular/core';
import { LoadingService } from '../../services/loading.service'; // adjust path
import { Observable } from 'rxjs/internal/Observable';
@Component({
  selector: 'app-loader',
  standalone: false,
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent {
  loading: Observable<boolean>;

  constructor(private loadingService: LoadingService) {
    this.loading = this.loadingService.loading$;
  }
}
