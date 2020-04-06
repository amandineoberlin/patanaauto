import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import _ from 'lodash';

import { FormDataService } from '../services/form-data.service';
import { UtilsService } from '../services/utils.service';
import { Constants } from '../constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  quickSearch: FormGroup;
  data: { [name: string]: Object };
  annonces: Object;
  annoncesSize: Number;
  maxAvailablePrice: number;
  marques: Array<string>;
  modeles: Array<string>;
  initFromPrice: Number;
  initToPrice: Number;
  showPriceRange: Boolean = false;
  blockSlider: Boolean = false;
  notFoundText: String = Constants.NOT_FOUND_MESSAGE;
  filteredAnnonces: Array<any> = [];

  constructor(
    private formDataService: FormDataService,
    private utilsService: UtilsService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  redirectToFilteredAnnonces() {
    const { marque, modele, price } = this.quickSearch.controls;

    const queryParams = {};
    if (marque.value) queryParams['marque'] = marque.value;
    if (modele.value) queryParams['modele'] = modele.value;
    if (price.value) queryParams['price'] = price.value;

    return this.router.navigate(['/annonces'],
      { queryParams });
  };

  inputPriceValue() {
    const input = $('.js-range-slider');
    return input.data();
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

  update() {
    this.marques = [];
    this.modeles = [];
    const form = this.quickSearch.controls;
    const { modeles, marques } = this.formDataService
      .matchTagValues(this.annonces, [
        { marques: form['marque'].value },
        { modeles: form['modele'].value }
      ]);
    this.marques = marques;
    this.modeles = modeles;
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

  submit() {
    const form = this.quickSearch.controls;
    const marque = form['marque'].value;
    const modele = form['modele'].value;
    const price = form['price'].value;

    this.router.navigate(['/annonces'], { queryParams: { marque, modele, price } });
  }

  hideSliderOnClick() {
    // hide price range slider when user clicks anywhere else than the input itself
    $('html').click((e) => {
      if (!this.showPriceRange) return;

      const isInsideSlider = e.target.className.indexOf('irs') > -1;
      const isInsideInput = e.target.className.indexOf('prix') > -1;
      const hasSliderParent = $(e.target).parent()[0].className.indexOf('irs') > -1;

      if (!isInsideInput && !isInsideSlider && !hasSliderParent) return this.showPriceRange = false;
    });
  }

  initSlider() {
    const updatePrice = (data) => {
      let value;
      if (data.from === data.to) value = `${data.from} €`
      else value = `${data.from} - ${data.to} €`;
      this.quickSearch.controls['price']
        .setValue(value, { emitEvent:false })
    }

    //@ts-ignore
    $('.js-range-slider').ionRangeSlider({
      type: 'double',
      min: 0,
      max: _.ceil(this.maxAvailablePrice),
      from: 1000,
      to: 5000,
      grid: true,
      prefix: '€',
      step: 50,
      onChange: updatePrice,
      onUpdate: updatePrice
    });
  }

  ngOnInit(): void {
    this.quickSearch = this.fb.group({
      marque: [null],
      modele: [null],
      price: [null]
    });

    this.formDataService.loadAnnonces({ quickSearch: true })
      .then(dataObj => {
        _.assign(this, dataObj);
        this.filteredAnnonces = _.clone(this.annonces);
        this.initSlider();
        this.utilsService.bootstrapClearButton(this.quickSearch.controls);
        this.hideSliderOnClick();
    });
  }

}
