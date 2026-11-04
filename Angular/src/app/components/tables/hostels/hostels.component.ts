import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortHeader, MatSortModule } from '@angular/material/sort';

import { ShowHostelsComponent } from '../show-hostels/show-hostels.component';
import { Int_Hostels } from '../../../Interfaces/Int_Hostels';
import { srv_Hostels } from '../../../Services/srv_Hostels';
import { ServiceAllService } from '../../../Services/service-all.service';
import { srv_Favorite } from '../../../Services/srv_Favorite';
import { AuthService } from '../../../Services/auth-service.service';
import { AttractionTypeNamePipe } from "../../../Pipes/attractionTypeName";
import { CommonModule } from '@angular/common';
import { regionNamePipe } from "../../../Pipes/regionName";
import { KashrutNamePipe } from "../../../Pipes/kashrutName";
import { RefreshService } from '../../../Services/RefreshService';

@Component({
  selector: 'app-hostels',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatSortModule,
    MatSortHeader,
    CommonModule,
    regionNamePipe,
    KashrutNamePipe
],
  templateUrl: './hostels.component.html',
  styleUrls: ['./hostels.component.scss'],
})
export class HostelsComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'like',
    'HostelsName',
    'Description',
    'regionId',
    'NumberOfPlaces',
    'kashrutId',
    'DetailsButton',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('searchControl') searchInput?: ElementRef<HTMLInputElement>;

  // dataSource!: MatTableDataSource<Int_Hostels>;
  dataSource = new MatTableDataSource<Int_Hostels>([]);
  areasofexpertisealData: Int_Hostels[] = [];

  showSearch: Boolean = false;

  RegionsArrayData: any;
  KashrutArrayData: any;

  selectedRegion: number = 0;
  selectedKashrut: number = 0;
  /** האזורים שנבחרו לסינון (ריק = ללא סינון לפי אזורים). */
  selectedRegions: number[] = [];

  userDetails: any;

  // 🔥 FIX: like state לפי key ולא לפי id בלבד
  isLiked: { [key: string]: boolean } = {};
  constructor(
    public Hostels: srv_Hostels,
    paginatorIntl: MatPaginatorIntl,
    public srv_all: ServiceAllService,
    public dialog: MatDialog,
    public srv_favorite: srv_Favorite,
    public authService: AuthService,
    public refreshService: RefreshService,
  ) {
    paginatorIntl.itemsPerPageLabel = 'מסלולים בעמוד:';
    paginatorIntl.nextPageLabel = 'העמוד הבא';
    paginatorIntl.previousPageLabel = 'העמוד הקודם';
    paginatorIntl.firstPageLabel = 'העמוד הראשון';
    paginatorIntl.lastPageLabel = 'העמוד האחרון';

    this.userDetails = this.authService.getUserData();

    this.RegionsArrayData = [];
    this.srv_all.getRegionsArray().subscribe({
      next: (data: any) => {
        this.RegionsArrayData = data ?? [];
      },
      error: (err) => {
        console.error('בעיה בהבאת האזורים', err);
        this.RegionsArrayData = [];
      },
    });
    this.KashrutArrayData = [];
    this.srv_all.getKashrutArray().subscribe({
      next: (data: any) => {
        this.KashrutArrayData = data ?? [];
      },
      error: (err) => {
        console.error('בעיה בהבאת סוגי הכשרויות', err);
        this.KashrutArrayData = [];
      },
    });

    this.loadData();
    this.initLikedState(); // 🔥 חשוב מאוד
  }

  ngOnInit() {
    //  this.dataSource = new MatTableDataSource(yourDataArray);

    // טעינה מחדש אחרי שינוי בנתוני הטבלה (הוספה/עריכה/מחיקה)
    this.refreshService.refresh$.subscribe(() => {
      this.loadData();

    });

    // הגדרת ה-sortingDataAccessor נעשית בפונקציה נפרדת,
    // כך שהיא נשמרת גם אחרי החלפת instance של dataSource ב-loadData
    this.configureSortingDataAccessor();
  }

  // 🗂️ ה-accessor של המיון — קובע לפי איזה ערך למיין כל עמודה
  configureSortingDataAccessor() {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'regionId': // אזור — מיון לפי שם האזור
          return this.getRegionLabel(item.regionId);
        case 'HostelsName': // שם מקום הלינה
          return item.HostelsName; // מתאים לשם בעמודה
        case 'Description': // תיאור
          return item.Description; // מתאים לשם בעמודה
        case 'NumberOfPlaces': // מספר מקומות
          return item.NumberOfPlaces; // מתאים לשם בעמודה
        case 'kashrutId': // כשרות
          return item.kashrutId; // מתאים לשם בעמודה
        default:
          return (item as any)[property]; // כל שאר המאפיינים
      }
    };
    
  }

  // 🔥 KEY ייחודי
  getKey(type: string, id: number): string {
    return `${type}-${id}`;
  }

  /** שם אזור מתוך הרשימה שנטענה מהשרת (getRegionsArray) — ערך מיידי למיון/סינון. */
  getRegionLabel(id: number): string {
    const item = (this.RegionsArrayData ?? []).find(
      (r: any) => Number(r.regionId) === Number(id),
    );
    return item?.regionName ?? '';
  }

  // 🔥 אתחול לייקים מה-service
  initLikedState() {
    const userId = this.userDetails?.userId;
    if (!userId) return;

    this.srv_favorite.getFavoritesByUserId(userId).subscribe((favs) => {
      favs.forEach((f) => {
        if (f.hostelsId) {
          this.isLiked[this.getKey('hostel', f.hostelsId)] = true;
        }
        if (f.attractionsId) {
          this.isLiked[this.getKey('attraction', f.attractionsId)] = true;
        }
        if (f.walkingTrailId) {
          this.isLiked[this.getKey('trail', f.walkingTrailId)] = true;
        }
      });
    });
  }

  loadData() {
    this.Hostels.GetHostels().subscribe({
      next: (rawData: Int_Hostels[]) => {
        console.log('נתוני מקומות לינה גולמיים:', rawData);
        this.areasofexpertisealData = rawData;

        const ELEMENT_DATA: Int_Hostels[] = rawData.map((hostel) => ({
          HostelsId: hostel.HostelsId,
          HostelsName: hostel.HostelsName,
          regionId: hostel.regionId,
          Address: hostel.Address,
          Description: hostel.Description,
          NumberOfPlaces: hostel.NumberOfPlaces,
          kashrutId: hostel.kashrutId,
          Phone: hostel.Phone,
        }));

        this.dataSource = new MatTableDataSource(ELEMENT_DATA);

        // החלפת ה-instance איפסה את ה-sortingDataAccessor — מגדירים אותו מחדש
        this.configureSortingDataAccessor();

        // חיבור ה-sort והפיגינציה אחרי שהנתונים הגיעו
        setTimeout(() => {
          if (this.paginator) this.dataSource.paginator = this.paginator;
          if (this.sort) this.dataSource.sort = this.sort;
        });
      },
      error: (err) => {
        console.error('שגיאה בהבאת מקומות הלינה:', err);
      },
    });
  }

  ngAfterViewInit() {
    if (this.paginator && this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }
  

  toggleFavorite(
    userId: number,
    id: number,
    type: 'attraction' | 'hostel' | 'trail',
  ): void {
    const key = this.getKey(type, id);

    if (this.srv_favorite.isFavorite(userId, id, type)) {
      this.srv_favorite.removeFavorite(userId, id, type);
      this.isLiked[key] = false;
    } else {
      this.srv_favorite.addFavorite(userId, id, type);
      this.isLiked[key] = true;
    }
  }

  openDialogRegistrations(element: Int_Hostels) {
    this.dialog.open(ShowHostelsComponent, {
      width: '850px',
      data: element,
    });
  }

  newHostel() {
    const element: Int_Hostels = {
      HostelsId: 0,
      HostelsName: '',
      regionId: 0,
      Address: '',
      Description: '',
      NumberOfPlaces: 0,
      kashrutId: 0,
      Phone: '',
    };

    this.dialog.open(ShowHostelsComponent, {
      width: '850px',
      data: element,
    });
  }

  ToShowSearch() {
    this.showSearch = !this.showSearch;
  }

  filterTable() {
    // קריאה מהקלט המקומי של טבלה זו (template ref), כדי לא להיתקל
    // בקלט של טבלאות אחרות בעלות אותו id שגורם לחיפוש שגוי.
    const searchText = this.searchInput?.nativeElement.value.trim().toLowerCase() ?? '';

    let filteredData: Int_Hostels[] = this.areasofexpertisealData;

    if (searchText) {
      filteredData = filteredData.filter(
        (x) =>
          String(x.Description).toLowerCase().includes(searchText) ||
          String(x.Address).toLowerCase().includes(searchText) ||
          String(x.HostelsName).toLowerCase().includes(searchText) ||
          String(x.NumberOfPlaces).toLowerCase().includes(searchText) ||
          String(x.Phone).toLowerCase().includes(searchText) ||
          this.getRegionLabel(x.regionId).toLowerCase().includes(searchText) ||
          String(this.srv_all.GetKashrutName(x.kashrutId)).toLowerCase().includes(searchText),
      );
    }

    // סינון לפי אזורים — מקום לינה חייב להיות באחד מהאזורים שנבחרו.
    if (this.selectedRegions.length > 0) {
      filteredData = filteredData.filter((x) =>
        this.selectedRegions.includes(Number(x.regionId)),
      );
    }

    this.dataSource.data = filteredData;
    this.paginator?.firstPage();
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
    this.filterTable();
  }

  resetFilters() {
    this.selectedRegion = 0;
    this.selectedKashrut = 0;
    this.selectedRegions = [];

    const kashrutSelect = document.getElementById(
      'KashrutSelect',
    ) as HTMLSelectElement;

    if (kashrutSelect) kashrutSelect.value = '0';

    // ניקוי שדה החיפוש החופשי כדי שהחיפוש הבא יחל מהתחלה
    if (this.searchInput) this.searchInput.nativeElement.value = '';

    this.dataSource.data = this.areasofexpertisealData;
    this.paginator?.firstPage();
  }
}
