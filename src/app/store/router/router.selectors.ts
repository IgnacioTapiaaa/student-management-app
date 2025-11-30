import { getRouterSelectors } from '@ngrx/router-store';
import { createSelector } from '@ngrx/store';

/**
 * Router Selectors
 * Provides access to router state from NGRX store
 */

// Get base router selectors
export const {
  selectCurrentRoute,
  selectFragment,
  selectQueryParams,
  selectQueryParam,
  selectRouteParams,
  selectRouteParam,
  selectRouteData,
  selectRouteDataParam,
  selectUrl,
  selectTitle
} = getRouterSelectors();

/**
 * Select route data (including title)
 */
export const selectRouteDataObject = createSelector(
  selectRouteData,
  (data) => data || {}
);

/**
 * Factory selector to get a specific route parameter
 * @param param - The parameter name to extract
 */
export const selectSpecificRouteParam = (param: string) => createSelector(
  selectRouteParams,
  (params) => params?.[param]
);

/**
 * Select route ID parameter
 */
export const selectRouteId = createSelector(
  selectRouteParams,
  (params) => params?.['id'] ? Number(params['id']) : null
);
