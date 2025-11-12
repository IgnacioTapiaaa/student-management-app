import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-inscription-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './inscription-stats.component.html',
  styleUrls: ['./inscription-stats.component.scss']
})
export class InscriptionStatsComponent {
  @Input() totalInscriptions: number = 0;
  @Input() activeInscriptions: number = 0;
  @Input() completedInscriptions: number = 0;
  @Input() cancelledInscriptions: number = 0;
}
