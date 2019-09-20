import { Component, OnInit } from '@angular/core';

import _ from 'lodash';

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
  showPriceRange: Boolean = false;
  inputPrice: String;

  constructor(private dataService: DataLoaderService) {}

  findCorrespondances(selected, prop, value) {
    return _.orderBy(_.compact(_.uniq(_.map(this.annonces, (annonce) => {
      if (annonce[prop][0] === selected) return annonce[value][0];
    }))));
  }

  togglePriceView() {
    this.showPriceRange = !this.showPriceRange;
    const input = $('.js-range-slider');
    if (_.isEmpty(input.data())) return;
    this.inputPrice = `${input.data('from')} - ${input.data('to')} €`;
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

  calculateMaxPrice(annonces) {
    return _.max(_.map(annonces, annonce => parseInt(annonce['VehiculePrixVenteTTC'][0])));
  }

  ngOnInit() {
    this.dataService.getAnnonces().then(dataObj => {
      this.data = dataObj;
      this.annonces = dataObj.annonces;
      this.annoncesSize = dataObj.annoncesSize;
      this.marques = _.orderBy(dataObj.marques);
      this.modeles = _.orderBy(dataObj.modeles);

      // init price range slider
      //@ts-ignore
      $('.js-range-slider').ionRangeSlider({
          type: 'double',
          min: 0,
          max: this.calculateMaxPrice(dataObj.annonces),
          from: 1000,
          to: 5000,
          grid: true,
          prefix: '€',
          step: 50,
          onChange: (data) => {
            const from = data.from;
            const to = data.to;
            this.inputPrice = `${from} - ${to} €`;
          }
      });

      // hide price range slider when user clicks anywhere else than the input itself
      $('html').click((e) => {
        const isInsideSlider = e.target.className.indexOf('irs') > -1;
        const isInsideInput = e.target.className.indexOf('prix') > -1;
        const hasSliderParent = $(e.target).parent()[0].className.indexOf('irs') > -1;

        if (this.showPriceRange) {
          if (!isInsideInput && !isInsideSlider && !hasSliderParent) {
            this.showPriceRange = false;
          }
        } 
      })
    });
  }

}
