import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { CoordinatorRegistrationsComponent } from '../coordinator-registrations/coordinator-registrations.component';
import { GuideRegistrationsComponent } from '../guide-registrations/guide-registrations.component';

@Component({
  selector: 'app-checker-guide-or-coordinator',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabGroup,
    MatTab,
    CoordinatorRegistrationsComponent,
    GuideRegistrationsComponent,
  ],
  templateUrl: './checker-guide-or-coordinator.component.html',
  styleUrl: './checker-guide-or-coordinator.component.scss',
  standalone: true,
})
export class CheckerGuideOrCoordinatorComponent {
  constructor(
    public dialogRef: MatDialogRef<CheckerGuideOrCoordinatorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private Router: Router,
  ) {}



  onClose(): void {
    this.dialogRef.close();
  }
}
