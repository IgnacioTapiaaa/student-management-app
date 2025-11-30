import { EntityState } from '@ngrx/entity';
import { Inscription } from '../../../core/models/inscription.interface';

/**
 * Inscriptions Feature State
 * Uses @ngrx/entity for normalized state management
 */
export interface InscriptionsState extends EntityState<Inscription> {
  selectedInscriptionId: number | null;
  loading: boolean;
  error: string | null;
  loaded: boolean;
}

/**
 * Initial state for inscriptions feature
 * EntityAdapter will initialize ids and entities properties
 */
export const initialInscriptionsState: Omit<InscriptionsState, 'ids' | 'entities'> = {
  selectedInscriptionId: null,
  loading: false,
  error: null,
  loaded: false
};
