import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Srv_Guide } from '../../../Services/srv-guide.service';
import { ServiceAllService } from '../../../Services/service-all.service';
import { RefreshService } from '../../../Services/RefreshService';
import { Int_Guide } from '../../../Interfaces/int-guide';
import { ShowGuideComponent } from '../show-guide/show-guide.component';

/** אפשרות אזור התמחות אחת בחיפוש/סינון לפי תחומים. */
interface AreaOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-table-guide',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
  ],
  templateUrl: './table-guide.component.html',
  styleUrl: './table-guide.component.scss',
})
export class TableGuideComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'FullName',
    'City',
    'PhoneNumber',
    'Email',
    'ReligiousId',
    'RegionId',
    'DetailsButton',
  ];

  isLoading = true;
  dataSource = new MatTableDataSource<Int_Guide>([]);

  /** כל אזורי ההתמחות — נטענים מהשרת (GET /All_Regions). */
  availableAreas: AreaOption[] = [];

  /** האזורים שנבחרו לסינון (ריק = ללא סינון לפי אזורים). */
  selectedAreas: number[] = [];

  /** החיפוש החופשי (טקסט חופשי). */
  searchText = '';

  /** כל המדריכות שנטענו מהשרת — הבסיס לכל סינון (טקסט + אזורים). */
  allGuides: Int_Guide[] = [];

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild('searchControl') searchInput?: ElementRef<HTMLInputElement>;

  constructor(
    public Guides: Srv_Guide,
    public srv_all: ServiceAllService,
    public refreshService: RefreshService,
    public dialog: MatDialog,
    paginatorIntl: MatPaginatorIntl,
  ) {
    paginatorIntl.itemsPerPageLabel = 'מדריכות בעמוד:';
    paginatorIntl.nextPageLabel = 'העמוד הבא';
    paginatorIntl.previousPageLabel = 'העמוד הקודם';
    paginatorIntl.firstPageLabel = 'העמוד הראשון';
    paginatorIntl.lastPageLabel = 'העמוד האחרון';

    this.configureSortingDataAccessor();
    this.loadData();
    this.loadAreas();
  }

  /** קובע לפי איזה ערך למיין כל עמודה (פועל יחד עם matSort). */
  private configureSortingDataAccessor() {
    this.dataSource.sortingDataAccessor = (g: Int_Guide, property: string) => {
      switch (property) {
        case 'FullName':
          return this.fullName(g);
        case 'ReligiousId':
          return this.getReligiousName(g.religiousId);
        case 'RegionId':
          return this.getRegionsNames(g.regionId);
        default:
          return (g as any)[property] ?? '';
      }
    };
  }

  ngOnInit() {
    // טעינה מחדש אחרי שינוי בנתוני הטבלה (הוספה/עדכון/מחיקה)
    this.refreshService.refresh$.subscribe(() => this.loadData());
  }

  ngAfterViewInit() {
    this.connectDataSource();
  }

  /** מחבר את המיון והפייג'ינייטור אל ה-dataSource (וחוזר על החיבור אחרי כל עדכון נתונים). */
  private connectDataSource() {
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;
  }

  /** טוען את כל אזורי ההתמחות מהשרת (GET /All_Regions). */
  loadAreas() {
    this.srv_all.getRegionsArray().subscribe({
      next: (areas: any[]) => {
        this.availableAreas = (areas ?? []).map((a) => ({
          id: Number(a.regionId),
          name: a.regionName ?? '',
        }));
        // עדכון העתק הנתונים כדי שהטבלה תציג את שמות האזורים שנטענו.
        this.refreshFilter();
        // חיבור מחדש — אם האזורים הגיעו אחרי שה-view התחבר.
        this.connectDataSource();
      },
      error: (err) => console.error('שגיאה בשליפת אזורי ההתמחות:', err),
    });
  }

  loadData() {
    this.isLoading = true;
    this.Guides.GetGuides(true).subscribe({
      next: (guides: Int_Guide[]) => {
        // שמירת כל המדריכות — הבסיס לסינון לפי אזור ומלל.
        this.allGuides = guides;
        this.refreshFilter();

        // לוג ל-console של שמות המדריכות שהתקבלו מהשרת.
        const names = guides.map((g) => this.fullName(g));
        console.log('שמות המדריכות שהתקבלו:', names);

        // שליפת שמות העדות מהשרת והצמדתם לשורות (בזמן שהן נטענות).
        this.enrichReligiousNames(guides);

        this.isLoading = false;
        // חיבור מחדש לאחר שהנתונים נטענו והטבלה קיימת ב-DOM.
        setTimeout(() => this.connectDataSource());
        // המיון מחובר גם מיידית — כדי שהסידור יוחל גם בלי לחכות ל-detection cycle.
        this.configureSortingDataAccessor();
      },
      error: (err) => {
        console.error('שגיאה בשליפת המדריכות:', err);
        this.isLoading = false;
      },
    });
  }

  /** שולף מהשרת את שם כל עדה לפי religiousId ומצמיד אותו לשורות המקושרות. */
  private enrichReligiousNames(guides: Int_Guide[]) {
    const ids = [...new Set(guides.map((g) => g.religiousId))];
    ids.forEach((id) =>
      this.srv_all.getReligiousName(id).subscribe({
        next: (name) => {
          guides
            .filter((g) => g.religiousId === id)
            .forEach((g) => (g.religiousName = name ?? 'אחר'));
          // הפעלת הסינון מחדש כדי שגם שמות העדות המעודכנים ישתתפו בו.
          this.refreshFilter();
        },
        error: () => {},
      }),
    );
  }

  /** שם מלא: שם פרטי + שם משפחה. */
  fullName(g: Int_Guide): string {
    return `${g.firstName ?? ''} ${g.lastName ?? ''}`.trim();
  }

  /** שם העדה לפי religiousId — נפל סטטי לצורך סינון ותצוגה מיידית
   *  (השם המדויק מהשרת נטען ונשמר ב-g.religiousName). */
  getReligiousName(id: number): string {
    switch (id) {
      case 1:
        return 'חסידי';
      case 2:
        return 'ספרדי';
      case 3:
        return 'אשכנזי';
      default:
        return 'אחר';
    }
  }
  /** שם אזור לפי הרשמית שנטענה מהשרת (GET /All_Regions); ריק אם לא ידוע. */
  getRegionName(id: number): string {
    const found = this.availableAreas.find((a) => a.id === id);
    return found ? found.name : '';
  }

  /** שמות אזורי ההתמחות מתוך מערך ה-regionId (מופרדים בפסיק). */
  getRegionsNames(ids: number[]): string {
    return (ids ?? []).map((id) => this.getRegionName(id)).join(', ');
  }

  /** החיפוש החופשי בטבלה. */
  applyFilter(event: Event) {
    this.searchText = (event.target as HTMLInputElement).value;
    this.refreshFilter();
  }

  /** בחירה/ביטול של אזור התמחות בסינון. */
  toggleArea(areaId: number, checked: boolean) {
    if (checked) {
      if (!this.selectedAreas.includes(areaId)) this.selectedAreas.push(areaId);
    } else {
      this.selectedAreas = this.selectedAreas.filter((a) => a !== areaId);
    }
    this.refreshFilter();
  }

  /** מריץ מחדש את הסינון (טקסט + אזורים) ונשאר בעמוד הראשון. */
  private refreshFilter() {
    const term = this.searchText.trim().toLowerCase();
    const filtered = this.allGuides.filter((g) => {
      // סינון לפי טקסט חופשי.
      if (term) {
        const matchesTerm =
          this.fullName(g).toLowerCase().includes(term) ||
          (g.city ?? '').toLowerCase().includes(term) ||
          (g.phoneNumber ?? '').toLowerCase().includes(term) ||
          (g.email ?? '').toLowerCase().includes(term) ||
          (this.getReligiousName(g.religiousId) ?? '')
            .toLowerCase()
            .includes(term) ||
          this.getRegionsNames(g.regionId).toLowerCase().includes(term);
        if (!matchesTerm) return false;
      }

      // סינון לפי אזורי התמחות — המדריכה חייבת להדריך בכל אזור שנבחר.
      if (this.selectedAreas.length > 0) {
        const guideAreas = g.regionId ?? [];
        return this.selectedAreas.every((a) => guideAreas.includes(a));
      }

      return true;
    });

    this.dataSource.data = filtered;
    if (this.paginator) this.paginator.firstPage();
  }

  /** מאפס את כל המסננים: חיפוש חופשי + אזורי התמחות. */
  resetFilters() {
    this.searchText = '';
    this.selectedAreas = [];
    // ניקוי שדה החיפוש החופשי כדי שהחיפוש הבא יחל מהתחלה
    if (this.searchInput) this.searchInput.nativeElement.value = '';

    this.refreshFilter();
  }

  /** פותח דיאלוג עם פרטי המדריכה — כמו בטבלאות האחרות. */
  openDialogRegistrations(element: Int_Guide) {
    this.dialog.open(ShowGuideComponent, {
      width: '500px',
      data: element,
    });
  }
}
