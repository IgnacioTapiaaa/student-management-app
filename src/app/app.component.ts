import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from './layout/main-layout.component';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, MainLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private router = inject(Router);
  title = 'student-management-app';

  // Show layout for all routes except login
  showLayout$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => !this.router.url.includes('/login')),
    startWith(!this.router.url.includes('/login'))
  );
}
