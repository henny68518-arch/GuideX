import { Component } from '@angular/core';
import { ScrollTopModule } from 'primeng/scrolltop';
import { MatIcon } from '@angular/material/icon';
import { Router} from '@angular/router';
import { AuthService } from '../../Services/auth-service.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  imports: [
    ScrollTopModule,
    MatIcon,
  ],
  styleUrls: ['./home-page.component.scss'],
  standalone: true,
})
export class HomePageComponent {
  openTrail: boolean;
  openAttraction: boolean;
  openHostels: boolean;
  openGuide: boolean;
  showBtnTable: boolean = false;
  constructor(private router: Router,
    public authService: AuthService
  ) {
    this.openTrail = false;
    this.openAttraction = false;
    this.openHostels = false;
    this.openGuide = false;
  }
  
  openBtnTable() {
    this.showBtnTable = !this.showBtnTable;
    if (this.showBtnTable) {
      setTimeout(() => {
        this.scroll();
      }, 100); // עיכוב קטן כדי לוודא שהרכיבים הוצגו
    }
  }
  openTable(tableNum: number) {
    switch (tableNum) {
      case 1:
        this.openTrail = !this.openTrail;
        break;
      case 2:
        this.openAttraction = !this.openAttraction;
        break;
      case 3:
        this.openHostels = !this.openHostels;
        break;
      case 4:
        this.openGuide = !this.openGuide;
        break;
    }
  }

  // openTipsForum(){
  //   // console.log("הגעתי")
  //   this.router.navigate(['welcome/forum/community']);

  // }

  openTipsForum(forumType: number) {
    this.showBtnTable = false;
    this.router.navigate(['welcome/forum'], {
      queryParams: { ForumType: forumType },
    });
  }

  openTrails() {
    console.log("Trails")
    this.showBtnTable = false;
    this.router.navigate(['welcome/Trails'])
  }
 
  openHostelsTable() {
    console.log("Hostels")
    this.showBtnTable = false;
    this.router.navigate(['welcome/Hostels'])
  } 
  
  openAttractions() {
    console.log("Attractions")
    this.showBtnTable = false;
    this.router.navigate(['welcome/Attractions'])
  } 
  
  openGuides() {
    console.log("Guides")
    this.showBtnTable = false;
    this.router.navigate(['welcome/Guides'])
  }

  openAdminGuides() {
    console.log("AdminGuide")
    this.showBtnTable = false;
    this.router.navigate(['welcome/AdminGuide'])
  }

  openAdminUsers() {
    console.log("AdminUsers")
    this.showBtnTable = false;
    this.router.navigate(['welcome/AdminUsers'])
  }

  openRegionSearch() {
    console.log("RegionSearch")
    this.showBtnTable = false;
    this.router.navigate(['welcome/RegionSearch'])
  }
  scroll() {
    const section = document.getElementById('search-section');
    section?.scrollIntoView({ behavior: 'smooth' });

  }


  openHalls(){
    console.log("Halls")
    alert("אנו עובדים על הוספת טבלת אולמות, בקרוב תוכל למצוא כאן מידע על אולמות ואולמות אודטוריום")
  }
}
