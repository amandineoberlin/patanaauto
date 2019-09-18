import { Component, OnInit } from '@angular/core';
import _ from 'lodash';
import * as $ from 'jquery';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  annonces: Object;
  annoncesSize: Number;
  marques: Array<string>;
  modeles: Array<string>;

  constructor(private http: HttpClient) { }

  public getAnnonces() {
    const marques = [];
    const modeles = [];

    return this.http.get('get-annonces')
      .toPromise()
      .then((annonces) => {
        this.annonces = annonces;
        this.annoncesSize = _.size(annonces);

        _.forEach(annonces, (vehicule) => {
          marques.push(vehicule.VehiculeModele.join());
          modeles.push(vehicule.VehiculeMarque.join());
        });

        this.marques = marques;
        this.modeles = modeles;
      })
  }

  ngOnInit() {
    (<any>$('.carousel')).carousel();
    this.getAnnonces();
  }

}
