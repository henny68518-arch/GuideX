import { Component, Inject } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { SucceededAlertComponent } from '../succeeded-alert/succeeded-alert.component';
import { ConfirmDeleteDialogComponent } from '../../confirm-delete-dialog/confirm-delete-dialog.component';
import { int_Attractions, int_AttractionFile } from '../../../Interfaces/int_Attractions';
import { ServiceAllService } from '../../../Services/service-all.service';
import { srv_Attractions } from '../../../Services/srv_Attractions';
import { srv_Favorite } from '../../../Services/srv_Favorite';
import { AttractionTypeNamePipe } from '../../../Pipes/attractionTypeName';
import { regionNamePipe } from '../../../Pipes/regionName';
import { RefreshService } from '../../../Services/RefreshService';
import { AuthService } from '../../../Services/auth-service.service';
import { SrvRatingService } from '../../../Services/srv-rating.service';
import {
  RatingDialogComponent,
  RatingDialogData,
} from '../../rating/rating-dialog/rating-dialog.component';
import { RatingEntityType } from '../../../Interfaces/int-rating';

@Component({
  selector: 'app-show-attraction',
  imports: [CommonModule, MatIcon, AttractionTypeNamePipe, regionNamePipe, FormsModule],
  templateUrl: './show-attraction.component.html',
  styleUrl: './show-attraction.component.scss',
  standalone: true,
})
export class ShowAttractionComponent {
  // public dialogRef!: MatDialogRef<ShowAttractionComponent>;
  //   @Inject(MAT_DIALOG_DATA)
  // public data!: int_Attractions;
  // imageUrl: string;
  userCanEdit = false;
  RegionsArrayData: any;
  AttractionsArrayData: any;
  isLiked: boolean = false;
  isAddNew = false;

  /** ממוצע הדירוג של האטרקציה (מבחוץ, בלי לפתוח דיאלוג). */
  ratingAverage = 0;
  /** מספר הדירוגים של האטרקציה. */
  ratingCount = 0;

  /** תמונות שכבר נשמרו בשרת עבור האטרקציה (לתצוגה ולמחיקה). */
  images: int_AttractionFile[] = [];
  /** קבצי תמונה שנבחרו אך טרם הועלו (לאטרקציה חדשה שעדיין אין לה ID). */
  pendingImages: File[] = [];

  userDetails: any = JSON.parse(localStorage.getItem('user_data') || '{}');

  constructor(
    public dialog: MatDialog,
    public authService: AuthService,
    public dialogRef: MatDialogRef<ShowAttractionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: int_Attractions,
    public srv_all: ServiceAllService,
    public Attractions: srv_Attractions,
    public srv_favorite: srv_Favorite,
        public refreshService: RefreshService,
    private srvRating: SrvRatingService,
  ) {
    // האיברים מאותחלים כמערכים כדי שה-@for בטמפלייט יפעל בצורה בטוחה
    this.RegionsArrayData = [];
    this.AttractionsArrayData = [];

    this.srv_all.getRegionsArray().subscribe(
      (data) => {
        this.RegionsArrayData = data;
      },
      (error) => {
        console.error('בעיה בהבאת האזורים', error);
      },
    );
    this.Attractions.getAttractionTypes().subscribe(
      (data) => {
        this.AttractionsArrayData = data;
      },
      (error) => {
        console.error('בעיה בהבאת סוגי האטרקציות', error);
      },
    );
    this.checkIfAddNew();
  }
  checkIfAddNew() {
    if (
      this.data &&
      this.data.address == '' &&
      this.data.attractionId == 0 &&
      this.data.attractionTypeId == 0 &&
      this.data.attractionsName == '' &&
      this.data.description == '' &&
      this.data.phone == '' &&
      this.data.regionId == 0 &&
      this.data.shomerShabat == 2
    ) {
      this.isAddNew = true;
      this.userCanEdit = true;
      console.log('this.isAddNew', this.isAddNew);
    }
  }
  ngOnInit() {
    const raw = localStorage.getItem('user_data');
    this.userDetails = raw ? JSON.parse(raw) : null;

    const userId = this.userDetails?.userId;

    if (!userId || !this.data?.attractionId) {
      this.isLiked = false;
      return;
    }

    this.isLiked = this.srv_favorite.isFavorite(
      userId,
      Number(this.data.attractionId),
      'attraction',
    );

    // טעינת התמונות של האטרקציה שנפתחה — שליפה לפי ה-ID שלה מהשרת.
    // (רק אם היא כבר שמורה בשרת; לאטרקציה חדשה עדיין אין ID).
    if (this.data?.attractionId && this.data.attractionId > 0) {
      this.Attractions.GetImages(this.data.attractionId).subscribe((imgs) => {
        this.images = imgs ?? [];
      });
    }

    // שליפת ממוצע הדירוג להצגה מבחוץ.
    this.loadAverage();
  }

  /** הממוצע מעוגל לשלם — לצורך הצגת הכוכבים המלאים. */
  get ratingAverageRounded(): number {
    return Math.round(this.ratingAverage);
  }

  /** שולף את ממוצע הדירוג ואת מספר הדירוגים של האטרקציה. */
  private loadAverage(): void {
    if (!this.data?.attractionId || this.data.attractionId <= 0) {
      this.ratingAverage = 0;
      this.ratingCount = 0;
      return;
    }
    this.srvRating.GetAverage(RatingEntityType.ATTRACTION, this.data.attractionId).subscribe((res) => {
      this.ratingAverage = res?.average ?? 0;
      this.ratingCount = res?.count ?? 0;
    });
  }

  toggleFavorite() {
    if (
      this.srv_favorite.isFavorite(
        this.userDetails?.userId,
        this.data.attractionId,
        'attraction',
      )
    ) {
      this.srv_favorite.removeFavorite(
        this.userDetails?.userId,
        this.data.attractionId,
        'attraction',
      );
      this.isLiked = false;
    } else {
      this.srv_favorite.addFavorite(
        this.userDetails?.userId,
        this.data.attractionId,
        'attraction',
      );
      this.isLiked = true;
    }
  }
  deleteAttraction() {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { message: 'האם את בטוחה שברצונך למחוק את האטרקציה?' },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        console.log('מחיקה בוטלה');
        return;
      }

      this.Attractions.deleteAttraction(this.data.attractionId).subscribe({
        next: () => {
          console.log('מחיקת מסלול');
          this.onClose();
          this.openDialogRegistrations('האטרקציה נמחקה בהצלחה');
          this.refreshService.triggerRefresh(); // רענון הטבלה אחרי שהמחיקה הסתיימה
        },
        error: (err) => {
          console.error('שגיאה במחיקת האטרקציה:', err);
          // כאן תוכל להציג הודעה למשתמש על השגיאה
        },
      });
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  /** פותח את דיאלוג הדירוגים של האטרקציה (גנריק, לפי Attraction). */
  openRatingDialog(): void {
    const data: RatingDialogData = {
      entityType: RatingEntityType.ATTRACTION,
      entityId: this.data.attractionId,
      entityName: this.data.attractionsName ?? undefined,
    };
    this.dialog.open(RatingDialogComponent, { width: '500px', data });
  }

  canEdit() {
    this.userCanEdit = true;
  }

  changeShomerShabat() {
    // הערך מתעדכן אוטומטית מה-[(ngModel)] של ה-select; נרמול למספר בלבד
    this.data.shomerShabat = Number(this.data.shomerShabat);
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
    return this.Attractions.ImageUrl(fileId);
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

    // אטרקציה קיימת — מעלים מיד לשרת.
    if (this.data?.attractionId && this.data.attractionId > 0) {
      this.Attractions.AddImages(this.data.attractionId, files).subscribe(
        (imgs) => {
          this.images = imgs ?? [];
        },
      );
    } else {
      this.pendingImages.push(...files);
    }

    input.value = '';
  }

  removePendingImage(index: number) {
    this.pendingImages.splice(index, 1);
  }

  deleteImage(fileId: number, index: number) {
    this.Attractions.DeleteImage(fileId).subscribe(() => {
      this.images.splice(index, 1);
    });
  }

  uploadPendingImages(newAttractionId: number) {
    if (!this.pendingImages.length) return;
    const files = [...this.pendingImages];
    this.pendingImages = [];
    this.Attractions.AddImages(newAttractionId, files).subscribe((imgs) => {
      this.images = imgs ?? [];
    });
  }

  saveEdit() {
    this.data.attractionsName = (this.data.attractionsName ?? '').trim();
    this.data.description = (this.data.description ?? '').trim();
    this.data.address = (this.data.address ?? '').trim();
    this.data.phone = (this.data.phone ?? '').trim();
    this.data.attractionTypeId = Number(this.data.attractionTypeId) || 0;
    this.data.regionId = Number(this.data.regionId) || 0;
    this.data.shomerShabat = Number(this.data.shomerShabat);


    if (this.isAddNew) {
      if (
        this.data.description.trim() == '' ||
        this.data.attractionTypeId == 0 ||
        this.data.regionId == 0
      ){
        return
      }
      this.Attractions.AddNewAttraction(this.data).subscribe({
        next: (saved: any) => {
          console.log('הוספת מסלול', saved);
          const newId =
            saved?.attractionId ?? saved?.attractionsId ?? this.data.attractionId;
          if (this.pendingImages.length && newId) {
            this.uploadPendingImages(newId);
          }
          this.onClose();
          this.openDialogRegistrations('האטרקציה נוספה בהצלחה');
          this.refreshService.triggerRefresh(); 

        },
        error: (err) => {
          console.error('שגיאה בהוספת האטרקציה:', err);
        },
      });
    } else {
      console.log(this.isAddNew, 'עדכון');

      this.Attractions.UpdateAttraction(this.data).subscribe({
        next: () => {
          console.log('עודכן בהצלחה');
          this.userCanEdit = false;
          this.openDialogRegistrations('האטרקציה עודכנה בהצלחה');
          this.refreshService.triggerRefresh(); // רענון הטבלה אחרי שהעדכון הסתיים

        },
        error: (err) => {
          console.error('שגיאה בעדכון:', err);
        },
      });

      this.userCanEdit = false;
    }

  }
  openDialogRegistrations(element: string) {
    const dialogRef = this.dialog.open(SucceededAlertComponent, {
      width: '160px',

      data: element,
    });
  }
}
