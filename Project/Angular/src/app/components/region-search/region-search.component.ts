import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { ServiceAllService } from '../../Services/service-all.service';
import { srv_Attractions } from '../../Services/srv_Attractions';
import { srv_Hostels } from '../../Services/srv_Hostels';
import { SrvWalkingTrailService } from '../../Services/srv-WalkingTrail.service';
import { Srv_Guide } from '../../Services/srv-guide.service';

import { int_Attractions } from '../../Interfaces/int_Attractions';
import { Int_Hostels } from '../../Interfaces/Int_Hostels';
import { Int_WalkingTrail } from '../../Interfaces/Int_WalkingTrail';
import { Int_Guide } from '../../Interfaces/int-guide';

import { ShowAttractionComponent } from '../tables/show-attraction/show-attraction.component';
import { ShowHostelsComponent } from '../tables/show-hostels/show-hostels.component';
import { ShowWalkingTrailComponent } from '../tables/show-walking-trail/show-walking-trail.component';
import { ShowGuideComponent } from '../tables/show-guide/show-guide.component';

@Component({
  selector: 'app-region-search',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './region-search.component.html',
  styleUrls: ['./region-search.component.scss'],
})
export class RegionSearchComponent {
  /** רשימת האזורים הזמינים (נטענת מהשרת). */
  regions: { id: number; name: string }[] = [];

  /** האזורים שנבחרו לסינון (ריק = לא נבחר עדיין שום אזור). */
  selectedRegions: number[] = [];

  // נתוני המקור — נטענים מהשרת.
  allAttractions: int_Attractions[] = [];
  allHostels: Int_Hostels[] = [];
  allTrails: Int_WalkingTrail[] = [];
  allGuides: Int_Guide[] = [];

  isLoading = true;
  private pendingLoads = 0;

    username = 'אנונימית';

  constructor(
    public srv_all: ServiceAllService,
    public srv_attractions: srv_Attractions,
    public srv_hostels: srv_Hostels,
    public srv_trails: SrvWalkingTrailService,
    public srv_guide: Srv_Guide,
    public dialog: MatDialog,
  ) {
    this.loadRegions();
    this.loadData();
  }
    ngOnInit() {
    const userD = localStorage.getItem('user_data');
    let userData: any = null;
    if (userD) {
      userData = JSON.parse(userD);
    }
    if (userData && userData.userId) {
      this.username = userData.firstName
    }
  }

  /** טוען את כל האזורים הזמינים מהשרת. */
  loadRegions() {
    this.srv_all.getRegionsArray().subscribe({
      next: (areas: any[]) => {
        this.regions = (areas ?? []).map((a) => ({
          id: Number(a.regionId),
          name: a.regionName ?? '',
        }));
      },
      error: (err) => console.error('שגיאה בשליפת אזורים:', err),
    });
  }

  /** טוען במקביל את כל ארבעת סוגי הנתונים מהשרת. */
  loadData() {
    this.isLoading = true;
    this.pendingLoads = 4;

    const done = () => {
      this.pendingLoads--;
      if (this.pendingLoads <= 0) this.isLoading = false;
    };

    this.srv_attractions.GetAttractions().subscribe({
      next: (d) => (this.allAttractions = d),
      error: () => {},
      complete: () => done(),
    });

    this.srv_hostels.GetHostels().subscribe({
      next: (d) => (this.allHostels = d),
      error: () => {},
      complete: () => done(),
    });

    this.srv_trails.GetWalkingTrails().subscribe({
      next: (d) => (this.allTrails = d),
      error: () => {},
      complete: () => done(),
    });

    this.srv_guide.GetGuides(true).subscribe({
      next: (d) => (this.allGuides = d),
      error: () => {},
      complete: () => done(),
    });
  }

  /** בחירה/ביטול של אזור בסינון. */
  toggleRegion(regionId: number, checked: boolean) {
    if (checked) {
      if (!this.selectedRegions.includes(regionId)) {
        this.selectedRegions.push(regionId);
      }
    } else {
      this.selectedRegions = this.selectedRegions.filter(
        (r) => r !== regionId,
      );
    }
  }

  /** בחירת כל האזורים / ביטול הכל. */
  toggleAll(checked: boolean) {
    this.selectedRegions = checked
      ? this.regions.map((r) => r.id)
      : [];
  }

  get hasSelection(): boolean {
    return this.selectedRegions.length > 0;
  }

  /** שם האזור מתוך רשימת האזורים שנטענה (בלי קריאה נוספת לשרת). */
  regionName(regionId: number | null | undefined): string {
    if (regionId == null) return '';
    const r = this.regions.find((x) => x.id === Number(regionId));
    return r ? r.name : '';
  }

  /** שמות האזורים (מופרדים בפסיקים) של מדריכה, בהתאם לאזורי ההתמחות שלה. */
  guideRegions(regionIds: number[] | null | undefined): string {
    return (regionIds ?? [])
      .map((id) => this.regionName(id))
      .filter((n) => n !== '')
      .join(' , ');
  }

  /** גלילה חלקה אל הכותרת של המדור הנבחר — באותו עמוד, בלי ניווט לקומפוננטה אחרת. */
  jumpTo(sectionId: string) {
    const el = document.getElementById(sectionId);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** ── סינון לפי האזורים שנבחרו ── */
  get filteredAttractions(): int_Attractions[] {
    if (!this.hasSelection) return [];
    return this.allAttractions.filter((a) =>
      this.selectedRegions.includes(Number(a.regionId)),
    );
  }

  get filteredHostels(): Int_Hostels[] {
    if (!this.hasSelection) return [];
    return this.allHostels.filter((h) =>
      this.selectedRegions.includes(Number(h.regionId)),
    );
  }

  get filteredTrails(): Int_WalkingTrail[] {
    if (!this.hasSelection) return [];
    return this.allTrails.filter((t) =>
      this.selectedRegions.includes(Number(t.regionId)),
    );
  }

  /** מדריכה מוצגת אם היא מדריכה באחד מהאזורים שנבחרו (regionId הוא מערך). */
  get filteredGuides(): Int_Guide[] {
    if (!this.hasSelection) return [];
    return this.allGuides.filter((g) =>
      (g.regionId ?? []).some((r) => this.selectedRegions.includes(Number(r))),
    );
  }

  /** ── פתיחת פופאפ פרטים ── */
  openAttraction(item: int_Attractions) {
    this.dialog.open(ShowAttractionComponent, { width: '850px', data: item });
  }

  openHostel(item: Int_Hostels) {
    this.dialog.open(ShowHostelsComponent, { width: '850px', data: item });
  }

  openTrail(item: Int_WalkingTrail) {
    this.dialog.open(ShowWalkingTrailComponent, { width: '850px', data: item });
  }

  openGuide(item: Int_Guide) {
    this.dialog.open(ShowGuideComponent, { width: '850px', data: item });
  }
}
