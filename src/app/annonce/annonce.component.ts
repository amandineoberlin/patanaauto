import { Component, OnInit, ɵConsole } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
//import { Observable } from 'rxjs';

import _ from 'lodash';

import { DataLoaderService } from '../services/data-loader.service';

@Component({
  selector: 'app-annonce',
  templateUrl: './annonce.component.html',
  styleUrls: ['./annonce.component.scss']
})
export class AnnonceComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataLoaderService: DataLoaderService,
  ) { }

  annonceId: Number;
  annonce: Object;
  equipement: Array<string>;
  //state: Observable<object>;

  mainImage(annonce) {
    return this.dataLoaderService.mainImage(annonce);
  }

  getEquipements() {
    return this.annonce['VehiculeEquipementsOptionArgus'][0].split('|');
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams
      .subscribe((params) => {
        this.annonceId = _.get(params, 'id');
      });

    this.annonce = this.activatedRoute.snapshot.data['annonce'];
    this.equipement = this.getEquipements();

    //@ts-ignore
  }

}
