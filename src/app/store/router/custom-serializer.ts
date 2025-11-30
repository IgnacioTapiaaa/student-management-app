import { RouterStateSnapshot } from '@angular/router';
import { RouterStateSerializer } from '@ngrx/router-store';

/**
 * Custom Router State Interface
 * Minimal representation of router state for NGRX store
 */
export interface RouterStateUrl {
  url: string;
  params: { [key: string]: string };
  queryParams: { [key: string]: string };
  data: { [key: string]: any };
}

/**
 * Custom Router State Serializer
 * Extracts minimal router state information for the store
 */
export class CustomSerializer implements RouterStateSerializer<RouterStateUrl> {
  serialize(routerState: RouterStateSnapshot): RouterStateUrl {
    let route = routerState.root;

    // Traverse to the deepest activated route
    while (route.firstChild) {
      route = route.firstChild;
    }

    const {
      url,
      root: { queryParams },
    } = routerState;
    const { params, data } = route;

    return {
      url,
      params,
      queryParams,
      data
    };
  }
}
