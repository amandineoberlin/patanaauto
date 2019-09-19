import _ from 'lodash';

import { Component, OnInit } from '@angular/core';

import { DataLoaderService } from '../data-loader.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit {

  data: { [name: string]: Object };
  annonces: Object;
  annoncesSize: Number;
  marques: Array<string>;
  modeles: Array<string>;
  selectedModele: String;
  selectedMarque: String;

  constructor(private dataService: DataLoaderService) {}

  findCorrespondances(selected, prop, value) {
    return _.orderBy(_.compact(_.uniq(_.map(this.annonces, (annonce) => {
      if (annonce[prop][0] === selected) return annonce[value][0];
    }))));
  }

  clearMarques() {
    this.modeles = _.orderBy(this.data.modeles);
    this.marques = _.orderBy(this.data.marques);
    this.selectedModele = null;
  }

  updateMarques() {
    if (!this.selectedModele) return this.marques;
    this.marques = this.findCorrespondances(this.selectedModele, 'VehiculeModele', 'VehiculeMarque');
  }

  updateModeles() {
    if (!this.selectedMarque) return this.modeles;
    this.modeles = this.findCorrespondances(this.selectedMarque, 'VehiculeMarque', 'VehiculeModele');
  }

  ngOnInit() {
    this.dataService.getAnnonces().then(dataObj => {
      this.data = dataObj;
      this.annonces = dataObj.annonces;
      this.annoncesSize = dataObj.annoncesSize;
      this.marques = _.orderBy(dataObj.marques);
      this.modeles = _.orderBy(dataObj.modeles);
    });
  }

}
