import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Int_Guide } from '../../../Interfaces/int-guide';
import { ServiceAllService } from '../../../Services/service-all.service';
import { SrvRatingService } from '../../../Services/srv-rating.service';
import {
  RatingDialogComponent,
  RatingDialogData,
} from '../../rating/rating-dialog/rating-dialog.component';
import { RatingEntityType } from '../../../Interfaces/int-rating';

@Component({
  selector: 'app-show-guide',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './show-guide.component.html',
  styleUrl: './show-guide.component.scss',
})
export class ShowGuideComponent {
  /** כל אזורי ההתמחות שנטענו מהשרת — להצגת שמות האזורים של המדריכה. */
  availableAreas: { id: number; name: string }[] = [];
  private religiousNames = new Map<number, string>();

  /** ממוצע הדירוג של המדריכה (מבחוץ, בלי לפתוח דיאלוג). */
  ratingAverage = 0;
  /** מספר הדירוגים של המדריכה. */
  ratingCount = 0;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ShowGuideComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Int_Guide,
    public srv_all: ServiceAllService,
    private srvRating: SrvRatingService,
  ) {
    this.srv_all.getRegionsArray().subscribe((areas: any[]) => {
      this.availableAreas = (areas ?? []).map((a) => ({
        id: Number(a.regionId),
        name: a.regionName ?? '',
      }));
    });
  }

  ngOnInit(): void {
    this.loadAverage();
  }

  /** שולף את ממוצע הדירוג ואת מספר הדירוגים של המדריכה. */
  private loadAverage(): void {
    if (!this.data?.guideId || this.data.guideId <= 0) {
      this.ratingAverage = 0;
      this.ratingCount = 0;
      return;
    }
    this.srvRating.GetAverage(RatingEntityType.GUIDE, this.data.guideId).subscribe((res) => {
      this.ratingAverage = res?.average ?? 0;
      this.ratingCount = res?.count ?? 0;
    });
  }

  /** הממוצע מעוגל לשלם — לצורך הצגת הכוכבים המלאים. */
  get ratingAverageRounded(): number {
    return Math.round(this.ratingAverage);
  }

  /** שם מלא: שם פרטי + שם משפחה. */
  fullName(g: Int_Guide): string {
    return `${g.firstName ?? ''} ${g.lastName ?? ''}`.trim();
  }

  /** שם אזור התמחות לפי regionId; ריק אם לא ידוע. */
  getRegionName(id: number): string {
    const found = this.availableAreas.find((a) => a.id === id);
    return found ? found.name : '';
  }

  /** שמות אזורי ההתמחות של המדריכה (מופרדים בפסיק). */
  getRegionsNames(ids: number[]): string {
    return (ids ?? []).map((id) => this.getRegionName(id)).join(', ');
  }

  getReligiousName(religiousId: number): string {
    if (!this.religiousNames.has(religiousId)) {
      this.religiousNames.set(religiousId, 'בטעינה…');
      this.srv_all.getReligiousName(religiousId).subscribe((name) => {
        this.religiousNames.set(religiousId, name ?? '');
      });
    }

    return this.religiousNames.get(religiousId) ?? 'בטעינה…';
  }

  /** פותח את דיאלוג הדירוגים של המדריכה (גנריק, לפי Guide). */
  openRatingDialog(): void {
    const data: RatingDialogData = {
      entityType: RatingEntityType.GUIDE,
      entityId: this.data.guideId,
      entityName: this.fullName(this.data),
    };
    this.dialog.open(RatingDialogComponent, { width: '500px', data });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
