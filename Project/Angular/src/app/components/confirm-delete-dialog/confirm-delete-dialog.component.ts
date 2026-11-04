import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDeleteData {
  /** ההודעה שתוצג במרכז הדיאלוג. */
  message: string;
  /** טקסט כפתור האישור (ברירת מחדל: "מחיקה"). */
  confirmText?: string;
  /** טקסט כפתור הביטול (ברירת מחדל: "ביטול"). */
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrl: './confirm-delete-dialog.component.scss',
  standalone: true,
})
export class ConfirmDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
