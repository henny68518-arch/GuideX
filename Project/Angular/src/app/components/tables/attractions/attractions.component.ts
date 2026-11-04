import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { ShowAttractionComponent } from '../show-attraction/show-attraction.component';
import { int_Attractions } from '../../../Interfaces/int_Attractions';
import { srv_Attractions } from '../../../Services/srv_Attractions';
import { ServiceAllService } from '../../../Services/service-all.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { srv_Favorite } from '../../../Services/srv_Favorite';
import { AuthService } from '../../../Services/auth-service.service';
import { AttractionTypeNamePipe } from "../../../Pipes/attractionTypeName";
import { regionNamePipe } from "../../../Pipes/regionName";
import { MatSort, MatSortHeader, MatSortModule } from '@angular/material/sort';
import { RefreshService } from '../../../Services/RefreshService';


@Component({
  selector: 'app-attractions',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatExpansionModule,
    NzSelectModule,
    FormsModule,
    AttractionTypeNamePipe,
    regionNamePipe,
    MatSortModule,
    MatSortHeader,
    CommonModule,
  ],
  templateUrl: './attractions.component.html',
  styleUrls: ['./attractions.component.scss'],
})
export class AttractionsComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'like',
    'AttractionsName',
    'Description',
    'regionId',
    'AttractionsTypeId',
    'ShomerShabat',
    'DetailsButton',
  ];

  isLoading = true;

  // dataSource!: MatTableDataSource<int_Attractions>;
  dataSource = new MatTableDataSource<int_Attractions>([]);
  areasofexpertisealData: int_Attractions[] = [];

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('searchControl') searchInput?: ElementRef<HTMLInputElement>;

  userDetails: any;
  RegionsArrayData: any;
  AttractionsArrayData: any;
  // map של סוגי אטרקציות (typeId -> שם) לשם מיון לפי טקסט
  attractionTypesMap: { [id: number]: string } = {};
  showSearch: Boolean = false;
  selectedRegion: number = 0;
  selectedAttractionType: number = 0;
  /** האזורים שנבחרו לסינון (ריק = ללא סינון לפי אזורים). */
  selectedRegions: number[] = [];
  // 🔥 FIX: key-based liked state (לא לפי ID בלבד)
  isLiked: { [key: string]: boolean } = {};

  constructor(
    public Attractions: srv_Attractions,
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

    this.RegionsArrayData = this.srv_all.getRegionsArray().subscribe(
      (data) => {
        this.RegionsArrayData = data;
      },
      (error) => {
        console.error('בעיה בהבאת האזורים', error);
      },
    );
    this.AttractionsArrayData = this.Attractions.getAttractionTypes();

    // מילוי ה-map של סוגי האטרקציות לשם מיון לפי טקסט
    this.Attractions.getAttractionTypes().subscribe((types: any) => {
      (types || []).forEach((t: any) => {
        const id = t.attractionTypeId ?? t.id;
        const name = t.attractionTypeName ?? t.name;
        if (id != null) this.attractionTypesMap[id] = name ?? String(id);
      });
    });

    this.loadData();
    this.initLikedState();
  }


  //  יצירת KEY ייחודי
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

  // אתחול לייקים מהשרת (DB)
  initLikedState() {
    const userId = this.userDetails?.userId;

    if (!userId) return;

    this.srv_favorite.getFavoritesByUserId(userId).subscribe((favs) => {
      favs.forEach((f) => {
        if (f.attractionsId) {
          this.isLiked[this.getKey('attraction', f.attractionsId)] = true;
        }
        if (f.hostelsId) {
          this.isLiked[this.getKey('hostel', f.hostelsId)] = true;
        }
        if (f.walkingTrailId) {
          this.isLiked[this.getKey('trail', f.walkingTrailId)] = true;
        }
      });
    });
  }

  loadData() {
    this.isLoading = true;
    this.Attractions.GetAttractions().subscribe({
      next: (rawData: int_Attractions[]) => {
        console.log("נתוני אטרקציות גולמיים:", rawData);
        this.areasofexpertisealData = rawData;
        this.dataSource.data = rawData;
        this.isLoading = false;

        // הטבלה נוצרת עכשיו (@else) — נחבר את ה-sort והפיגינציה
        setTimeout(() => {
          if (this.paginator) this.dataSource.paginator = this.paginator;
          if (this.sort) this.dataSource.sort = this.sort;
        });
      },

      error: (err) => {
        console.log(err);
        this.isLoading = false;
      },
    });
  }
  
  ngOnInit() {
 //טעינה מחדש לאחר שינוי בנתוני הטבלה
    this.refreshService.refresh$.subscribe(() => {
      this.loadData(); // טען מחדש את הנתונים
    });
 

    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'AttractionsName':
          return item.attractionsName;
        case 'Description':
          return item.description;
        case 'regionId':
          // מיון לפי שם האזור (טקסט) ולא לפי ה-ID
          return this.getRegionLabel(Number(item.regionId));
        case 'AttractionsTypeId':
          // מיון לפי שם סוג האטרקציה (טקסט) ולא לפי ה-ID
          return (
            this.attractionTypesMap[Number(item.attractionTypeId)] ??
            String(item.attractionTypeId)
          );
        case 'ShomerShabat':
          // מיון לפי הטקסט שמוצג בעמודה
          return item.shomerShabat === 2
            ? 'שומר שבת'
            : item.shomerShabat === 1
              ? 'לא ידוע'
              : 'לא שומר שבת';
        default:
          return item[property];
      }
    };
  }

  

  // ngAfterViewInit() {
  //   // חיבור גיבוי של ה-sort והפיגינציה כשה-view מוכן
  //   setTimeout(() => {
  //     if (this.paginator) this.dataSource.paginator = this.paginator;
  //     if (this.sort) this.dataSource.sort = this.sort;
  //   });
  // }
ngAfterViewInit() {
  console.log('aaa')
  // חיבור ה-paginator וה-sort
  setTimeout(() => {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort; // חיבור ה-sort
    }
  });
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

  openDialogRegistrations(element: int_Attractions) {
    this.dialog.open(ShowAttractionComponent, {
      width: '850px',
      data: element,
    });
  }

  newAttraction() {
    const element: int_Attractions = {
      attractionId: 0,
      attractionsName: "",
      regionId: 0,
      address: "",
      attractionTypeId: 0,
      description: "",
      shomerShabat: 2,
      phone: ""
    };

    this.dialog.open(ShowAttractionComponent, {
      width: '850px',
      data: element
    });
  }


  ToShowSearch() {
    this.showSearch = !this.showSearch;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterTable() {
    // קריאה מהקלט המקומי של טבלה זו (template ref), כדי לא להיתקל
    // בקלט של טבלאות אחרות בעלות אותו id שגורם לחיפוש שגוי.
    const searchText = this.searchInput?.nativeElement.value.trim().toLowerCase() ?? '';

    let filteredData: int_Attractions[] = [...this.areasofexpertisealData];

    if (searchText) {
      filteredData = filteredData.filter((x) => {
        const regionValue = this.getRegionLabel(Number(x.regionId));

        const regionText = regionValue.toLowerCase();

        return (
          (x.description ?? '').toLowerCase().includes(searchText) ||
          (x.address ?? '').toLowerCase().includes(searchText) ||
          (x.attractionsName ?? '').toLowerCase().includes(searchText) ||
          (x.phone ?? '').toLowerCase().includes(searchText) ||
          regionText.includes(searchText)
        );
      });
    }

    // סינון לפי אזורים — אטרקציה חייבת להיות באחד מהאזורים שנבחרו.
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
    console.log('aaa')
    this.selectedRegion = 0;
    this.selectedAttractionType = 0;
    this.selectedRegions = [];

    const typeSelect = document.getElementById(
      'AttractionTypeSelect',
    ) as HTMLSelectElement | null;

    if (typeSelect) typeSelect.value = '0';

    // ניקוי שדה החיפוש החופשי כדי שהחיפוש הבא יחל מהתחלה
    if (this.searchInput) this.searchInput.nativeElement.value = '';

    this.dataSource.data = this.areasofexpertisealData;
    this.paginator?.firstPage();
  }


}
