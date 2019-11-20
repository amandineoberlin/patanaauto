import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { NgSelectModule } from '@ng-select/ng-select';

import { AppRoutingModule } from './app-routing.module';
import { DataLoaderService } from './services/data-loader.service';
import { AnnonceResolve } from './annonce/annonce-resolver';
import { DateAgoPipe } from './pipes/date-ago.pipe';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AnnoncesComponent } from './annonces/annonces.component';
import { AnnonceComponent } from './annonce/annonce.component';
import { CartegriseComponent } from './cartegrise/cartegrise.component';
import { FinancementComponent } from './financement/financement.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { PlanComponent } from './plan/plan.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    AnnoncesComponent,
    CartegriseComponent,
    FinancementComponent,
    AboutComponent,
    ContactComponent,
    PlanComponent,
    PageNotFoundComponent,
    DateAgoPipe,
    AnnonceComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MDBBootstrapModule
  ],
  schemas: [ NO_ERRORS_SCHEMA ],
  providers: [
    DataLoaderService,
    AnnonceResolve
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
