import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth-service.service';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {

  constructor(private router: Router,
    public authService: AuthService,
  ) { 
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['']);
      }
  }

  goHome(): void {
    this.router.navigate(['/welcome/Home_Page']);
  }

}
