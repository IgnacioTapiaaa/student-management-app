import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontSizeDirective } from '../shared/directives/font-size.directive';
import { AuthService } from '../core/auth/auth.service';
import { selectToolbarTitle } from '../store/ui/ui.selectors';

/**
 * Main Layout Component
 * Provides the application shell with toolbar, sidenav, and content area
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
    FontSizeDirective
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private store = inject(Store);

  sidenavOpened = signal<boolean>(true);

  // UI State from Store
  toolbarTitle$ = this.store.select(selectToolbarTitle);

  // Auth-related computed signals
  currentUser = this.authService.currentUser;
  userFullName = this.authService.userFullName;
  isAdmin = this.authService.isAdmin;

  toggleSidenav(): void {
    this.sidenavOpened.update(value => !value);
  }

  logout(): void {
    this.authService.logout();
  }
}
