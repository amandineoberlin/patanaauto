import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import _ from 'lodash';

import { DataLoaderService } from '../data-loader.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit {

  quickSearch: FormGroup;
  data: { [name: string]: Object };
  annonces: Object;
  annoncesSize: Number;
  maxAvailablePrice: number;
  marques: Array<string>;
  modeles: Array<string>;
  initFromPrice: Number = 1000;
  initToPrice: Number = 5000;
  showPriceRange: Boolean = false;
  blockSlider: Boolean = false;

  constructor(private dataService: DataLoaderService, private fb: FormBuilder) {}

  inputPriceValue() {
    const input = $('.js-range-slider');
    return input.data();
  }

  findCorrespondances(selected, prop, value) {
    return _.orderBy(_.compact(_.uniq(_.map(this.annonces, (annonce) => {
      if (annonce[prop][0] === selected) return annonce[value][0];
    }))));
  }

  togglePriceView() {
    if (this.blockSlider) return;

    this.showPriceRange = !this.showPriceRange;
    const price = this.inputPriceValue();
    if (_.isEmpty(price)) return;

    const input = $('.js-range-slider');
    this.quickSearch.controls['price'].setValue(`${input.data('from')} - ${input.data('to')} €`);
  }

  clearPrice() {
    if (this.blockSlider) return;

    const price = this.inputPriceValue();
    if (price) this.quickSearch.controls['price'].setValue(null);
  }

  clearModele() {
    this.updatePriceRange();
  }

  clearMarque() {
    this.modeles = _.orderBy(this.data.modeles);
    this.marques = _.orderBy(this.data.marques);
    this.quickSearch.controls['modele'].setValue(null);
    this.updatePriceRange();
  }

  updateMarques() {
    const selectedModele = this.quickSearch.controls['modele'].value;
    if (!selectedModele) return this.marques;
    this.marques = this.findCorrespondances(selectedModele, 'VehiculeModele', 'VehiculeMarque');
    this.updatePriceRange();
  }

  updateModeles() {
    const selectedMarque = this.quickSearch.controls['marque'].value;
    if (!selectedMarque) return this.modeles;
    this.modeles = this.findCorrespondances(selectedMarque, 'VehiculeMarque', 'VehiculeModele');
    this.updatePriceRange();
  }

  choosePriceClass() {
    if (this.blockSlider) return 'hide';
    return this.showPriceRange ? 'show' : 'hide';
  }

  updatePriceRange() {
    this.blockSlider = false;

    const modele = this.quickSearch.controls['modele'].value;
    const marque = this.quickSearch.controls['marque'].value;
    const reset = !modele && !marque;
    let availableMinPrice = null;

    if (modele) {
      const availableModelePrice = _.compact(_.map(this.annonces, (annonce) => {
        if (annonce.VehiculeModele[0] === modele) return annonce['VehiculePrixVenteTTC'][0];
      }));
      availableMinPrice = parseInt(_.min(availableModelePrice));
    } else if (marque) {
      const availableModelePrice = _.compact(_.map(this.annonces, (annonce) => {
        if (annonce.VehiculeMarque[0] === marque) return annonce['VehiculePrixVenteTTC'][0];
      }));
      availableMinPrice = parseInt(_.min(availableModelePrice));
    } else {
      availableMinPrice = 0;
    }

    if (availableMinPrice >= 0) {
      const slider = $('.js-range-slider');
      const sliderInstance = slider.data("ionRangeSlider");

      if (availableMinPrice === this.maxAvailablePrice) {
        this.quickSearch.controls['price'].setValue(`${availableMinPrice} €`);
        return this.blockSlider = true;
      }

      sliderInstance.update({
        min: availableMinPrice,
        max: this.maxAvailablePrice,
        from: reset ? this.initFromPrice : availableMinPrice,
        to: reset ? this.initToPrice : this.maxAvailablePrice
      });

      this.quickSearch.controls['price'].setValue(`${slider.data('from')} - ${slider.data('to')} €`);
    }
  }

  calculateMaxPrice(annonces) {
    return _.max(_.map(annonces, annonce => parseInt(annonce['VehiculePrixVenteTTC'][0])));
  }

  ngOnInit() {
    this.quickSearch = this.fb.group({
        marque: [null],
        modele: [null],
        price: [null]
    });

    this.dataService.getAnnonces().then(dataObj => {
      this.data = dataObj;
      this.annonces = dataObj.annonces;
      this.annoncesSize = dataObj.annoncesSize;
      this.marques = _.orderBy(dataObj.marques);
      this.modeles = _.orderBy(dataObj.modeles);
      this.maxAvailablePrice = this.calculateMaxPrice(dataObj.annonces);

      // init price range slider
      //@ts-ignore
      $('.js-range-slider').ionRangeSlider({
          type: 'double',
          min: 0,
          max: this.maxAvailablePrice,
          from: 1000,
          to: 5000,
          grid: true,
          prefix: '€',
          step: 50,
          onChange: (data) => {
            const from = data.from;
            const to = data.to;
            this.quickSearch.controls['price'].setValue(`${from} - ${to} €`);
          }
      });
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
    });
  }

}
