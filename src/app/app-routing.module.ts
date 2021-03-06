import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnnoncesResolver } from './annonces/annonces-resolver';
import { AnnonceResolver } from './annonce/annonce-resolver';

import { HomeComponent } from './home/home.component';
import { AnnoncesComponent } from './annonces/annonces.component';
import { AnnonceComponent } from './annonce/annonce.component';
import { ServiceComponent } from './service/service.component';
import { AboutComponent } from './about/about.component';
import { PlanComponent } from './plan/plan.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  {
    path: 'annonces',
    component: AnnoncesComponent,
    resolve: {
      annonces: AnnoncesResolver
    }
  },
  {
    path: 'annonce',
    component: AnnonceComponent,
    resolve: {
      annonce: AnnonceResolver
    }
  },
  { path: 'service', component: ServiceComponent },
  { path: 'about', component: AboutComponent },
  { path: 'plan', component: PlanComponent },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
  { path: '404', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true,
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
