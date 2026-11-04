import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page.component/home-page.component';
import { ResetPasswordComponent } from './components/login/reset-password/reset-password.component';
import { WelcomePageComponent } from './components/login/welcome-page/welcome-page.component';
import { TipsForumComponent } from './components/forum/tips-forum/tips-forum.component';
import { HomeComponent } from './components/home/home.component';
import { FevoriteComponent } from './components/fevorite/fevorite.component';
import { AttractionsComponent } from './components/tables/attractions/attractions.component';
import { HostelsComponent } from './components/tables/hostels/hostels.component';
import { WalkingTrailComponent } from './components/tables/walking-trail/walking-trail.component';
import { TableGuideComponent } from './components/tables/table-guide/table-guide.component';
import { RegionSearchComponent } from './components/region-search/region-search.component';
import { AdminGuidePermissionComponent } from './components/admin-page/admin-guide-permission.component/admin-guide-permission.component';
import { UserPermissionsComponent } from './components/admin-page/user-permissions/user-permissions.component';
import { permissionGuard } from './guards/permission-guard.guard';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { homePageGuard } from './guards/home-page-guard.guard';

export const routes: Routes = [
  { path: '', component: WelcomePageComponent },
  //   { path: 'welcome', component: WelcomePageComponent },
  { path: 'Login/reset', component: ResetPasswordComponent },
  {
    path: 'welcome',
    component: HomeComponent,
    canActivate: [homePageGuard],
    children: [
      { path: 'forum', component: TipsForumComponent },
      { path: 'Favorites', component: FevoriteComponent },
      { path: 'Home_Page', component: HomePageComponent },
      { path: 'Trails', component: WalkingTrailComponent },
      { path: 'Hostels', component: HostelsComponent },
      { path: 'Attractions', component: AttractionsComponent },
      { path: 'Guides', component: TableGuideComponent },
      { path: 'RegionSearch', component: RegionSearchComponent },

      {
        path: 'AdminGuide', component: AdminGuidePermissionComponent,
        canActivate: [permissionGuard('userManagement')],
      },
      {
        path: 'AdminUsers', component: UserPermissionsComponent,
        canActivate: [permissionGuard('userManagement')],
      },

    ],
  },

  { path: '**', component: NotFoundComponent },
  { path: 'welcome', component: HomePageComponent },
];


