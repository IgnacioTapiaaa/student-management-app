import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-student-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './student-stats.component.html',
  styleUrls: ['./student-stats.component.scss']
})
export class StudentStatsComponent {
  @Input() totalStudents: number = 0;
  @Input() averageAge: number = 0;
}
