import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { SrvRatingService } from '../../../Services/srv-rating.service';
import { AuthService } from '../../../Services/auth-service.service';
import { Int_Rating, Int_RatingList } from '../../../Interfaces/int-rating';
import { HebrewDateConverterPipe } from '../../../Pipes/hebrewDateConverter ';

/** הנתונים שמועברים לדיאלוג בעת פתיחתו: סוג הישות ומזהה הישות, ואופציונלי שם לתצוגה. */
export interface RatingDialogData {
  entityType: string;
  entityId: number;
  entityName?: string;
}

@Component({
  selector: 'app-rating-dialog',
  standalone: true,
  imports: [CommonModule, HebrewDateConverterPipe, FormsModule, MatDialogModule, MatIconModule],
  templateUrl: './rating-dialog.component.html',
  styleUrls: ['./rating-dialog.component.scss'],
})
export class RatingDialogComponent {
  /** כל התשובה מהשרת: ממוצע, מספר דירוגים ורשימת הדירוגים עם שמות. */
  list: Int_RatingList = { average: 0, count: 0, ratings: [] };

  /** דגל טעינה — מוצג "טוען…" בזמן שליפת הדירוגים. */
  isLoading = true;
  /** הודעת שגיאה בזמן טעינת הדירוגים. */
  errorMessage = '';

  /** מספר הכוכבים שנבחרו בטופס ההוספה (0 = עדיין לא בחרו). */
  selectedStars = 0;
  /** טקסט הערת ההוספה — מחובר ל-textarea. */
  note = '';
  /** דגל שמנע לחיצה כפולה על "שמור" בזמן שהשליחה רצה. */
  isSubmitting = false;
  /** הודעת שגיאה של טופס ההוספה. */
  submitError = '';

  /** האם להציג את טופס ההוספה — רק למרכזת פעילה (canRate). */
  canAdd = false;

  constructor(
    private srvRating: SrvRatingService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: RatingDialogData,
    private dialogRef: MatDialogRef<RatingDialogComponent>
  ) {
    // בדיקה אם למשתמש המחובר יש הרשאת canRate (רכזת פעילה).
    this.canAdd = this.authService.hasPermission('canRate');
  }

  /** פונקציית ריבוי המרווחים (Lifecycle) — נקראת אוטומטית בפתיחת הרכיב. */
  ngOnInit(): void {
    this.load();
  }

  /**
   * טעינת הדירוגים מהשרת לפי סוג הישות והמזהה שנמסרו לדיאלוג.
   * - הצלחה → שמירה ב-list והצגת ממוצע ורשימה.
   * - כשל → הצגת errorMessage.
   */
  load(): void {
    this.isLoading = true;
    this.srvRating.GetList(this.data.entityType, this.data.entityId).subscribe({
      next: (res) => {
        this.list = res;
        this.isLoading = false;
        this.errorMessage = '';
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'שגיאה בטעינת הדירוגים';
      },
    });
  }

  /** שם המדרגת — מחזיר "שם פרטי שם משפחה", או "משתמש" אם ריק. */
  raterName(r: Int_Rating): string {
    const full = `${r.firstName} ${r.lastName}`.trim();
    return full || 'משתמש';
  }

  /** המערכים [1,2,3,4,5] — משמש ללולאת הכוכבים בטופס ההוספה וללולאת הצגת הכוכבים. */
  get starOptions(): number[] {
    return [1, 2, 3, 4, 5];
  }

  /** הממוצע מעוגל לשלם — לצורך הצגת הכוכבים המלאים בסיכום. */
  get averageRounded(): number {
    return Math.round(this.list.average);
  }

  /** בחירת כוכב בטופס ההוספה — מעדכן את selectedStars. */
  pickStar(n: number): void {
    this.selectedStars = n;
    this.submitError = '';
  }

  /**
   * שליחת הדירוג החדש.
   * - אימות: חייבים לבחור 1–5 כוכבים ולהוסיף הערה.
   * - הצלחה → איפוס הטופס ורענון הרשימה.
   * - שגיאה → הצגת submitError.
   */
  submit(): void {
    if (this.selectedStars < 1) {
      this.submitError = 'נא לבחור מספר כוכבים.';
      return;
    }
    if (!this.note.trim()) {
      this.submitError = 'נא להוסיף הערה לדירוג.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.srvRating.AddRating({
      entityType: this.data.entityType,
      entityId: this.data.entityId,
      numberOfStars: this.selectedStars,
      note: this.note.trim(),
    }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res) {
          // איפוס הטופס ורענון הרשימה.
          this.selectedStars = 0;
          this.note = '';
          this.load();
        } else {
          this.submitError = 'שגיאה בהוספת הדירוג.';
        }
      },
      error: () => {
        this.isSubmitting = false;
        this.submitError = 'שגיאה בהוספת הדירוג.';
      },
    });
  }

  /** סגירת הדיאלוג. */
  onClose(): void {
    this.dialogRef.close();
  }
}
