import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-succeeded-alert',
  imports: [MatIcon],
  templateUrl: './succeeded-alert.component.html',
  styleUrl: './succeeded-alert.component.scss'
})
export class SucceededAlertComponent {
  constructor(
public dialogRef: MatDialogRef<SucceededAlertComponent>, 
  @Inject(MAT_DIALOG_DATA) public data: string ){}
 


   ngOnInit() {
    setTimeout(() => {
      this.dialogRef.close(); // סוגר את הדיאלוג
    }, 1300); // 7000 מילישניות = 7 שניות
  }
}

