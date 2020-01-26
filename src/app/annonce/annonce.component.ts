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
  options: Array<string>;
  //state: Observable<object>;

  mainImage(annonce) {
    return this.dataLoaderService.mainImage(annonce);
  }

  getOptions() {
    const options = this.annonce['VehiculeEquipementsOptionArgus'][0].split('|');
    const equip = this.annonce['VehiculeEquipementsSerieArgus'][0].split('|');

    return _.concat(options, equip);
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams
      .subscribe((params) => {
        this.annonceId = _.get(params, 'id');
      });

    this.annonce = this.activatedRoute.snapshot.data['annonce'];
    this.options = this.getOptions();

    //@ts-ignore
  }

}
