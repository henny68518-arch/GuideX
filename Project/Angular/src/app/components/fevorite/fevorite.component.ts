import { Component } from '@angular/core';
import { AuthService } from '../../Services/auth-service.service';
import { srv_Favorite } from '../../Services/srv_Favorite';
import { SrvWalkingTrailService } from '../../Services/srv-WalkingTrail.service';
import { srv_Attractions } from '../../Services/srv_Attractions';
import { srv_Hostels } from '../../Services/srv_Hostels';
import { ShowAttractionComponent } from '../tables/show-attraction/show-attraction.component';
import { int_Attractions } from '../../Interfaces/int_Attractions';
import { MatDialog } from '@angular/material/dialog';
import { ShowHostelsComponent } from '../tables/show-hostels/show-hostels.component';
import { Int_Hostels } from '../../Interfaces/Int_Hostels';
import { ShowWalkingTrailComponent } from '../tables/show-walking-trail/show-walking-trail.component';
import { Int_WalkingTrail } from '../../Interfaces/Int_WalkingTrail';
import { int_Favorite } from '../../Interfaces/int_Favorite';

@Component({
  selector: 'app-fevorite',
  standalone: true,
  imports: [],
  templateUrl: './fevorite.component.html',
  styleUrl: './fevorite.component.scss',
})
export class FevoriteComponent {
  allTheFavorite: int_Favorite[] = [];

  isLiked: boolean[] = [];

  userDetails: any;

  constructor(
    public authService: AuthService,
    public srv_favorite: srv_Favorite,
    public srv_walkingTrail: SrvWalkingTrailService,
    public srv_attractions: srv_Attractions,
    public srv_hostels: srv_Hostels,
    public dialog: MatDialog,
  ) {
    this.userDetails = this.authService.getUserData();
    const userId = Number(this.userDetails?.userId);

    if (userId) {
      this.srv_favorite.getFavoritesByUserId(userId).subscribe((favorites) => {
        this.allTheFavorite = favorites;
        this.isLiked = favorites.map(() => true);
      });
    }
  }

  openDialogShowAttraction(element: int_Attractions) {
    console.log('אטרקציה');
    this.dialog.open(ShowAttractionComponent, {
      width: '850px',
      data: element,
    });
  }

  openDialogShowHostels(element: Int_Hostels) {
    console.log('מקום לינה');
    this.dialog.open(ShowHostelsComponent, {
      width: '850px',
      data: element,
    });
  }

  openDialogWalkingTrail(element: Int_WalkingTrail) {
    console.log('מסלול הליכה');
    this.dialog.open(ShowWalkingTrailComponent, {
      width: '850px',
      data: element,
    });
  }

  
  openDialogForItem(item: int_Favorite) {
    if (item.itemType === 'attraction' && item.attractionsId != null) {
      this.srv_attractions.GetAttractions().subscribe((list) => {
        const found = list.find((a) => a.attractionId === item.attractionsId);
        if (found) this.openDialogShowAttraction(found);
      });
    } else if (item.itemType === 'hostel' && item.hostelsId != null) {
      this.srv_hostels.GetHostels().subscribe((list) => {
        const found = list.find((h) => h.HostelsId === item.hostelsId);
        if (found) this.openDialogShowHostels(found);
      });
    } else if (item.itemType === 'trail' && item.walkingTrailId != null) {
      this.srv_walkingTrail.GetWalkingTrails().subscribe((list) => {
        const found = list.find(
          (t) => t.WalkingTrailId === item.walkingTrailId,
        );
        if (found) this.openDialogWalkingTrail(found);
      });
    }
  }

  /** מוריד/מוסיף מועדף לפי מצב הלב. */
  changeLikeStatus(item: int_Favorite) {
    const index = this.allTheFavorite.indexOf(item);
    const userId = Number(this.userDetails?.userId);

    const type: 'attraction' | 'hostel' | 'trail' | null =
      item.itemType === 'attraction' || item.itemType === 'hostel' || item.itemType === 'trail'
        ? item.itemType
        : null;

    if (!type) return;

    const id =
      type === 'attraction'
        ? item.attractionsId
        : type === 'hostel'
          ? item.hostelsId
          : item.walkingTrailId;

    if (id == null) return;

    if (this.isLiked[index]) {
      // מסירים מהשרת (לפי ה-favoriteId — בטוח יותר).
      this.srv_favorite.removeByFavoriteId(item.favoriteId);
    } else {
      // מוסיפים.
      this.srv_favorite.addFavorite(userId, id, type);
    }

    this.isLiked[index] = !this.isLiked[index];
    // עדכון התייחסות כדי ש-render יראה את השינוי (אם צריך).
    this.allTheFavorite = [...this.allTheFavorite];
  }
}
