import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { SucceededAlertComponent } from '../succeeded-alert/succeeded-alert.component';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog/confirm-delete-dialog.component';
import { Int_Hostels, Int_HostelFile } from '../../../Interfaces/Int_Hostels';
import { ServiceAllService } from '../../../Services/service-all.service';
import { srv_Hostels } from '../../../Services/srv_Hostels';
import { srv_Favorite } from '../../../Services/srv_Favorite';
import { regionNamePipe } from "../../../Pipes/regionName";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RefreshService } from '../../../Services/RefreshService';
import { KashrutNamePipe } from "../../../Pipes/kashrutName";
import { AuthService } from '../../../Services/auth-service.service';
import { SrvRatingService } from '../../../Services/srv-rating.service';
import {
  RatingDialogComponent,
  RatingDialogData,
} from '../../rating/rating-dialog/rating-dialog.component';
import { RatingEntityType } from '../../../Interfaces/int-rating';

@Component({
  selector: 'app-show-hostels',
  imports: [
    MatIcon,
    regionNamePipe,
    KashrutNamePipe,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './show-hostels.component.html',
  styleUrl: './show-hostels.component.scss',
})
export class ShowHostelsComponent {
  userCanEdit = false;
  RegionsArrayData: any;
  KashrutArrayData: any;
  isLiked: boolean = false;
  isAddNew = false;

  /** ממוצע הדירוג של מקום הלינה (מבחוץ, בלי לפתוח דיאלוג). */
  ratingAverage = 0;
  /** מספר הדירוגים של מקום הלינה. */
  ratingCount = 0;

  /** תמונות שכבר נשמרו בשרת עבור מקום הלינה (לתצוגה ולמחיקה). */
  images: Int_HostelFile[] = [];
  /** קבצי תמונה שנבחרו אך טרם הועלו (למקום לינה חדש שעדיין אין לו ID). */
  pendingImages: File[] = [];

  userDetails: any = JSON.parse(localStorage.getItem('user_data') || '{}');

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ShowHostelsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Int_Hostels,
    public srv_all: ServiceAllService,
    public hostels: srv_Hostels,
    public srv_favorite: srv_Favorite,
    public refreshService: RefreshService,
    public authService: AuthService,
    private srvRating: SrvRatingService
  ) {
    this.RegionsArrayData = this.srv_all.getRegionsArray().subscribe(
      (data) => {
        this.RegionsArrayData = data; // שמירת הנתונים במשתנה
      },
      (error) => {
        console.error('בעיה בהבאת האזורים', error);
      },
    );
    this.srv_all.getKashrutArray().subscribe(
      (data) => {
        this.KashrutArrayData = data; // שמירת הנתונים במשתנה
      },
      (error) => {
        console.error('בעיה בהבאת סוגי הכשרויות', error);
      },
    );
    this.checkIfAddNew();
  }

  checkIfAddNew() {
    if (
      this.data &&
      this.data.HostelsId == 0 &&
      this.data.HostelsName == '' &&
      this.data.Description == '' &&
      this.data.Address == '' &&
      this.data.Phone == '' &&
      this.data.NumberOfPlaces == 0 &&
      this.data.regionId == 0 &&
      this.data.kashrutId == 0
    ) {
      this.isAddNew = true;
      this.userCanEdit = true;
      console.log('this.isAddNew', this.isAddNew);
    }
  }

  ngOnInit() {
    // ווידוא שהערך להשוואה הוא מספר — כך ה-select יציג את הכשרות הקיימת
    // (ה-API עשוי להחזיר מזהים כ-strings, מה שגורם ל=== להיכשל).
    this.data.kashrutId = Number(this.data.kashrutId) || 0;
    this.data.regionId = Number(this.data.regionId) || 0;

    const raw = localStorage.getItem('user_data');
    this.userDetails = raw ? JSON.parse(raw) : null;

    const userId = this.userDetails?.userId;

    if (!userId || !this.data?.HostelsId) {
      this.isLiked = false;
      return;
    }

    this.isLiked = this.srv_favorite.isFavorite(
      userId,
      Number(this.data.HostelsId),
      'hostel',
    );

    // טעינת התמונות של מקום הלינה שנפתח — שליפה לפי ה-ID שלו מהשרת.
    // (רק אם הוא כבר שמור בשרת; למקום לינה חדש עדיין אין ID).
    if (this.data?.HostelsId && this.data.HostelsId > 0) {
      this.hostels.GetImages(this.data.HostelsId).subscribe((imgs) => {
        this.images = imgs ?? [];
      });
    }

    // שליפת ממוצע הדירוג להצגה מבחוץ.
    this.loadAverage();
  }

  /** שולף את ממוצע הדירוג ואת מספר הדירוגים של מקום הלינה. */
  private loadAverage(): void {
    if (!this.data?.HostelsId || this.data.HostelsId <= 0) {
      this.ratingAverage = 0;
      this.ratingCount = 0;
      return;
    }
    this.srvRating.GetAverage(RatingEntityType.HOSTEL, this.data.HostelsId).subscribe((res) => {
      this.ratingAverage = res?.average ?? 0;
      this.ratingCount = res?.count ?? 0;
    });
  }

  /** הממוצע מעוגל לשלם — לצורך הצגת הכוכבים המלאים. */
  get ratingAverageRounded(): number {
    return Math.round(this.ratingAverage);
  }
  toggleFavorite() {
    if (
      this.srv_favorite.isFavorite(
        this.userDetails?.userId,
        this.data.HostelsId,
        'hostel',
      )
    ) {
      this.srv_favorite.removeFavorite(
        this.userDetails?.userId,
        this.data.HostelsId,
        'hostel',
      );
      this.isLiked = false;
    } else {
      this.srv_favorite.addFavorite(
        this.userDetails?.userId,
        this.data.HostelsId,
        'hostel',
      );
      this.isLiked = true;
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  /** פותח את דיאלוג הדירוגים של מקום הלינה (גנריק, לפי Hostel). */
  openRatingDialog(): void {
    const data: RatingDialogData = {
      entityType: RatingEntityType.HOSTEL,
      entityId: this.data.HostelsId,
      entityName: this.data.HostelsName ?? undefined,
    };
    this.dialog.open(RatingDialogComponent, { width: '500px', data });
  }

  canEdit() {
    this.userCanEdit = true;
  }
  saveEdit() {
    // הערכים נקראים ישירות מ- this.data דרך [(ngModel)] בטמפלייט,
    // כך שכל דיאלוג עובד עם אובייקט הנתונים שלו.
    this.data.HostelsName = (this.data.HostelsName ?? '').trim();
    this.data.Description = (this.data.Description ?? '').trim();
    this.data.Address = (this.data.Address ?? '').trim();
    this.data.Phone = (this.data.Phone ?? '').trim();
    this.data.NumberOfPlaces = Number(this.data.NumberOfPlaces) || 0;
    this.data.regionId = Number(this.data.regionId) || 0;
    this.data.kashrutId = Number(this.data.kashrutId) || 0;

    console.log('data:  henny: ', this.data);

    if (this.isAddNew) {
      if (
        this.data.Description.trim() == '' ||
        this.data.HostelsName.trim() == '' ||
        this.data.regionId == 0 ||
        this.data.kashrutId == 0
      ) {
        return;
      }
      this.hostels.AddNewHostel(this.data).subscribe({
        next: (saved: any) => {
          console.log('הוספת מקום לינה', saved);
          // מקום הלינה נשמר — עכשיו יש לו ID. אם נבחרו תמונות, מעלים אותן אליו.
          const newId =
            saved?.HostelsId ?? saved?.hostelsId ?? this.data.HostelsId;
          if (this.pendingImages.length && newId) {
            this.uploadPendingImages(newId);
          }
          this.onClose();
          this.openDialogRegistrations('מקום הלינה נוסף בהצלחה');
          this.refreshService.triggerRefresh(); // רענון הטבלה אחרי שהוספה
        },
        error: (err) => {
          console.error('שגיאה בהוספת מקום הלינה:', err);
        },
      });
    } else {
      this.hostels.UpdateHostel(this.data).subscribe({
        next: () => {
          console.log('נתונים נשמרו', this.data);
          this.userCanEdit = false;
          this.openDialogRegistrations('נתוני האכסניה עודכנו בהצלחה');
          this.refreshService.triggerRefresh(); // רענון הטבלה אחרי שהעדכון הסתיים
        },
        error: (err) => {
          console.error('שגיאה בעדכון האכסניה:', err);
        },
      });
    }
  }

  deleteHostel() {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { message: 'האם את בטוחה שברצונך למחוק את מקום הלינה?' },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        console.log('מחיקה בוטלה');
        return;
      }

      this.hostels.deleteHostel(this.data.HostelsId).subscribe({
        next: () => {
          console.log('מחיקת מקום לינה');
          this.onClose();
          this.openDialogRegistrations('מקום הלינה נמחק בהצלחה');
          this.refreshService.triggerRefresh(); // רענון הטבלה אחרי שהמחיקה הסתיימה
        },
        error: (err) => {
          console.error('שגיאה במחיקת מקום הלינה:', err);
        },
      });
    });
  }


  openDialogRegistrations(element: string) {
    const dialogRef = this.dialog.open(SucceededAlertComponent, {
      width: '160px',

      data: element, // העברת הנתונים לדיאלוג
    });
  }

  // ─────────── תמונות ───────────

  /** כתובת התמונה הפתוחה בתצוגה גדולה (null = פתוחה אין). */
  previewImageUrl: string | null = null;

  /** פותח את התמונה בתצוגה גדולה (lightbox). */
  openImagePreview(url: string) {
    this.previewImageUrl = url;
  }

  /** סוגר את תצוגת התמונה הגדולה. */
  closeImagePreview() {
    this.previewImageUrl = null;
  }

  /** כתובת URL לתצוגת תמונה שמורה לפי ה-FileId שלה בשרת. */
  imageUrl(fileId: number): string {
    return this.hostels.ImageUrl(fileId);
  }

  /** כתובת URL זמנית לתצוגת קובץ מקומי שנבחר (טרם הועלה). */
  pendingImageUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /** בחירת קבצי תמונה חדשים. */
  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);

    // מקום לינה קיים — מעלים מיד לשרת.
    if (this.data?.HostelsId && this.data.HostelsId > 0) {
      this.hostels.AddImages(this.data.HostelsId, files).subscribe(
        (imgs) => {
          this.images = imgs ?? [];
        },
      );
    } else {
      // מקום לינה חדש (אין עדיין ID) — שומרים את הקבצים להעלאה אחרי השמירה.
      this.pendingImages.push(...files);
    }

    // איפוס שדה הבחירה כדי שאפשר יהיה לבחור שוב את אותו קובץ.
    input.value = '';
  }

  /** מחיקת קובץ חדש שטרם הועלה (למקום לינה חדש). */
  removePendingImage(index: number) {
    this.pendingImages.splice(index, 1);
  }

  /** מחיקת תמונה שמורה מהשרת ומהתצוגה. */
  deleteImage(fileId: number, index: number) {
    this.hostels.DeleteImage(fileId).subscribe(() => {
      this.images.splice(index, 1);
    });
  }

  /** מעלה את הקבצים שנבחרו למקום לינה חדש, אחרי שזה נשמר (יש כבר ID). */
  uploadPendingImages(newHostelsId: number) {
    if (!this.pendingImages.length) return;
    const files = [...this.pendingImages];
    this.pendingImages = [];
    this.hostels.AddImages(newHostelsId, files).subscribe((imgs) => {
      this.images = imgs ?? [];
    });
  }
}
