import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, distinctUntilChanged } from 'rxjs/operators';
import { setToolbarTitle } from '../../store/ui/ui.actions';
import { selectRouteData } from '../../store/router/router.selectors';

/**
 * Title Service
 * Automatically updates the toolbar title based on router navigation
 */
@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private router = inject(Router);
  private store = inject(Store);

  private readonly DEFAULT_TITLE = 'Student Management System';

  /**
   * Initialize the title service
   * Listens to router navigation events and updates toolbar title
   */
  init(): void {
    // Listen to route data changes from NGRX Router Store
    this.store.select(selectRouteData).pipe(
      map(data => data?.['title'] || this.DEFAULT_TITLE),
      distinctUntilChanged()
    ).subscribe(title => {
      this.store.dispatch(setToolbarTitle({ title }));
    });

    // Alternative approach: Listen to router NavigationEnd events
    // This is useful for setting initial title on app load
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // The selectRouteData selector will handle the title update
    });
  }
}
