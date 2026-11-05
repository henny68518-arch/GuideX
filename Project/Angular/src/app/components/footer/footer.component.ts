import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';


interface FooterLink {
  label: string;
  path: string;
  queryParams?: { [key: string]: number };
}

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  links: FooterLink[] = [
    { label: 'דף הבית', path: '/welcome/Home_Page' },
    { label: 'פורום חוויות והמלצות', path: '/welcome/forum', queryParams: { ForumType: 1 } },
    { label: 'פורום שאלות כלליות', path: '/welcome/forum', queryParams: { ForumType: 2 } },
    { label: 'פורום בטיחות', path: '/welcome/forum', queryParams: { ForumType: 3 } },
    { label: 'המעודפים', path: '/welcome/Favorites' },
    { label: 'מסלולי הליכה', path: '/welcome/Trails' },
    { label: 'מקומות לינה', path: '/welcome/Hostels' },
    { label: 'אטרקציות', path: '/welcome/Attractions' },
    { label: 'מדריכים', path: '/welcome/Guides' },
    { label: 'חיפוש אזור', path: '/welcome/RegionSearch' },
  ];
}
