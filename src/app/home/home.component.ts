import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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

export class HomeComponent implements OnInit, OnDestroy {
  quickSearch: FormGroup;
  data: { [name: string]: object };
  annonces: object;
  latestAnnonces: object;
  annoncesSize: number;
  marques: Array<string>;
  modeles: Array<string>;
  initFromPrice: number;
  initToPrice: number;
  showPriceRange: boolean;
  blockSlider: false;
  notFoundText: string = Constants.NOT_FOUND_MESSAGE;
  filteredAnnonces: Array<any> = [];
  priceFrom: number;
  priceTo: number;
  verticalScrollIndicator: boolean;
  horizontalScrollIndicator: boolean;

  constructor(
    private formDataService: FormDataService,
    private utilsService: UtilsService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  @HostListener('window:resize') onResize() {
    this.setScrollIndicator();
  }

  imageClass(id) {
    return `img-responsive card-img-top ${id}`;
  }

  redirectToFilteredAnnonces() {
    const { marque, modele, price } = this.quickSearch.controls;

    const queryParams = {};
    if (marque.value) queryParams['marque'] = marque.value;
    if (modele.value) queryParams['modele'] = modele.value;
    if (price.value) queryParams['price'] = price.value;

    return this.router.navigate(['/annonces'],
      { queryParams });
  }

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

    return $('.js-range-slider')
      .data('ionRangeSlider')
      .update({
        from: this.priceFrom,
        to: this.priceTo
      });
  }

  clearModele() {
    const form = this.quickSearch.controls;
    form['modele'].setValue(null);

    if (!form['marque'].value) {
      this.modeles = _.orderBy(this.data.modeles);
      this.marques = _.orderBy(this.data.marques);
      return;
    }

    const { modeles } = this.matchTagValues(this.annonces, [
      { marques: form['marque'].value }
    ]);
    this.modeles = modeles;
  }

  clearMarque() {
    this.quickSearch.controls['modele'].setValue(null);
    this.modeles = _.orderBy(this.data.modeles);
    this.marques = _.orderBy(this.data.marques);
  }

  matchTagValues(annonces, tags) {
    const marques = [];
    const modeles = [];
    const selleries = [];
    const versions = [];
    const vehicules = Constants.VEHICULE_PROPS;

    _.forEach(tags, (tag) => {
      const property = _.keys(tag)[0];
      const tagValue = tag[property];
      if (!tagValue) return;

      _.forEach(annonces, (annonce) => {
        if (annonce[vehicules[property]][0] === tagValue) {
          marques.push(annonce[vehicules['marques']][0]);
          modeles.push(annonce[vehicules['modeles']][0]);
          selleries.push(annonce[vehicules['selleries']][0]);
          versions.push(annonce[vehicules['versions']][0]);
        }
      });
    });

    return {
      marques: _.uniq(marques),
      modeles: _.uniq(modeles),
      selleries: _.uniq(selleries),
      versions: _.uniq(versions)
    };
  }

  update() {
    const form = this.quickSearch.controls;
    const { modeles, marques } = this.matchTagValues(this.annonces, [
      { marques: form['marque'].value },
      { modeles: form['modele'].value }
    ]);
    this.marques = marques;
    this.modeles = modeles;
  }

  redirectToAnnonce(id) {
    return this.router.navigate(['/annonce'], { queryParams: { id } });
  }

  getDefaultLatestAnnonces(latestAnnonces, annoncesSize) {
    const defaultSize = 6;
    const orderBy = _.map(this.annonces, a =>
      ({ _id: a._id, item: this.utilsService.parseDate(a.VehiculeDate1Mec[0]) }));
    const orderedItems = _.orderBy(orderBy, ['item'], ['desc']);
    const orderedAnnonces = _.map(orderedItems, a => _.find(this.filteredAnnonces, { _id: a._id }));
    const neededItemSize = defaultSize - annoncesSize;
    return this.latestAnnonces = _.concat(latestAnnonces, _.slice(orderedAnnonces, 0, neededItemSize));
  }

  buildLatestAnnonces(data) {
    if (_.isEmpty(data)) return this.getDefaultLatestAnnonces([], 0);

    const dataImmatriculation = _.flatMap(data, 'VehiculeImmatriculation');
    const latestAnnonces = _.filter(this.annonces, a =>
      _.includes(dataImmatriculation, a.VehiculeImmatriculation[0]));
    const annoncesSize = _.size(latestAnnonces);

    if (annoncesSize === 6) return this.latestAnnonces = latestAnnonces;
    if (annoncesSize > 6) return this.latestAnnonces = _.slice(latestAnnonces, 0, 6);
    if (annoncesSize < 6) return this.getDefaultLatestAnnonces(latestAnnonces, annoncesSize);
  }

  choosePriceClass() {
    if (this.blockSlider) return 'hide';
    return this.showPriceRange ? 'show' : 'hide';
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
    $('body').on('click', (e) => {
      if (!this.showPriceRange) return;

      const isInsideSlider = e.target.className.indexOf('irs') > -1;
      const isInsideInput = e.target.className.indexOf('price') > -1;
      const hasSliderParent = $(e.target).parent()[0].className.indexOf('irs') > -1;

      if (!isInsideInput && !isInsideSlider && !hasSliderParent) return this.showPriceRange = false;
    });
  }

  initSlider() {
    const updatePrice = (data) => {
      const value = (data.from === data.to) ? `${data.from} €` : `${data.from} - ${data.to} €`;
      this.quickSearch.controls['price']
        .setValue(value, { emitEvent: false });
    };

    // @ts-ignore
    $('.js-range-slider').ionRangeSlider({
      type: 'double',
      min: 0,
      max: Constants.MAX_PRICE,
      from: this.priceFrom,
      to: this.priceTo,
      grid: true,
      prefix: '€',
      step: 50,
      onChange: updatePrice,
      onUpdate: updatePrice
    });
  }

  scroll(side) {
    const container = $('.last-annonces');
    const distance = 100;
    const step = 10;
    const isVertical = side === 'vertical';

    let scrollValue = isVertical ? container.scrollTop() : container.scrollLeft();
    let scrollAmount = 0;
    const slideTimer = setInterval(() => {
      scrollValue = scrollValue += step;
      isVertical ? container.scrollTop(scrollValue) : container.scrollLeft(scrollValue);
      scrollAmount = scrollAmount += step;
      if (scrollAmount >= distance) {
        window.clearInterval(slideTimer);
      }
    }, 25);
  }

  isSmallScreen() {
    return $(window).width() <= 991;
  }

  setScrollIndicator() {
    const container = $('.last-annonces');
    const isSmallScreen = this.isSmallScreen();
    this.verticalScrollIndicator = container.get(0).scrollHeight > container.outerHeight() && !isSmallScreen;
    this.horizontalScrollIndicator = container.get(0).scrollWidth > container.outerWidth() && isSmallScreen;
  }

  waitForElement(selector, callback) {
    if ($(selector).length) return callback();
    return setTimeout(() => this.waitForElement(selector, callback), 50);
  }

  removeAllEventListeners() {
    return $('body').off();
  }

  ngOnDestroy(): void {
    this.removeAllEventListeners();
  }

  ngOnInit(): void {
    this.quickSearch = this.fb.group({
      marque: [null],
      modele: [null],
      price: [null]
    });

    this.showPriceRange = false;
    this.priceFrom = Constants.PRICE_FROM;
    this.priceTo = Constants.PRICE_TO;

    const dataPromises = [
      this.formDataService.loadAnnonces({ quickSearch: true }),
      this.formDataService.loadRecentAnnonces()
    ];

    Promise
      .all(dataPromises)
      .then(([{ data: annonce }, recentAnnonces]) => {
        _.assign(this, annonce);
        this.filteredAnnonces = _.clone(this.annonces);
        this.initSlider();
        this.utilsService.bootstrapClearButton(this.quickSearch.controls, ['price']);
        this.hideSliderOnClick();
        this.buildLatestAnnonces(recentAnnonces);
      });

    this.waitForElement('.annonce', () =>
      setTimeout(() => this.setScrollIndicator(), 200));
  }

}
