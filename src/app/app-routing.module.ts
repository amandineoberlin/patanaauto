import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnnonceResolve } from './annonce/annonce-resolver';

import { HomeComponent } from './home/home.component';
import { AnnoncesComponent } from './annonces/annonces.component';
import { AnnonceComponent } from './annonce/annonce.component';
import { CartegriseComponent } from './cartegrise/cartegrise.component';
import { FinancementComponent } from './financement/financement.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { PlanComponent } from './plan/plan.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'annonces', component: AnnoncesComponent },
  { path: 'annonce', component: AnnonceComponent, resolve: { annonce: AnnonceResolve } },
  { path: 'carte-grise', component: CartegriseComponent },
  { path: 'financement', component: FinancementComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'plan', component: PlanComponent },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
