import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { NgSelectModule } from '@ng-select/ng-select';

import { AppRoutingModule } from './app-routing.module';
import { DataLoaderService } from './services/data-loader.service';
import { AnnoncesResolver } from './annonces/annonces-resolver';
import { AnnonceResolver } from './annonce/annonce-resolver';
import { DateAgoPipe } from './pipes/date-ago.pipe';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AnnoncesComponent } from './annonces/annonces.component';
import { AnnonceComponent } from './annonce/annonce.component';
import { AboutComponent } from './about/about.component';
import { PlanComponent } from './plan/plan.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ServiceComponent } from './service/service.component';
import { SvgLoaderComponent } from './svg-loader/svg-loader.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    AnnoncesComponent,
    AboutComponent,
    PlanComponent,
    PageNotFoundComponent,
    DateAgoPipe,
    AnnonceComponent,
    ServiceComponent,
    SvgLoaderComponent
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
    AnnonceResolver,
    AnnoncesResolver
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
