import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Chart from 'chart.js';

import _ from 'lodash';

import { FormDataService } from '../services/form-data.service';

@Component({
  selector: 'app-annonce',
  templateUrl: './annonce.component.html',
  styleUrls: ['./annonce.component.scss']
})
export class AnnonceComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private formDataService: FormDataService
  ) { }

  annonceId: number;
  annonce: any;
  options: object;
  index: number;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;

  enlargeImage() {
    if ($('.enlarged-img').length) return;

    const image = $('#annonceCarousel .active').find('img');
    if (!image) return;

    $('body')
      .prepend(`<div class="d-flex justify-content-center enlarged-img">` +
        `<div class="cloned-img-container">` +
        `<i class="fa fa-times-circle cloned-img-icon" (click)="clearEnlarged()"></i>` +
        `<img class="cloned-img" src="${image.attr('src')}"></div></div>`);

    $('.content').css({
      opacity: .3,
      overflow: 'hidden',
      maxHeight: 'calc(100vh - 76.5px)'
    });

    $('.cloned-img-icon').on('click', () => this.clearEnlarged());
  }

  clearEnlarged() {
    const enlargedEl = '.enlarged-img';
    if (!$(enlargedEl)) return;

    $('body').find(enlargedEl).remove();

    $('.content').css({
      opacity: 1,
      overflow: 'auto',
      maxHeight: '100%'
    });
  }

  setControlsActiveness() {
    const imagesSize = _.size(this.annonce.images);
    const i = this.index + 1;
    this.isPrevDisabled = i === 1 ? true : false;
    this.isNextDisabled = i >= imagesSize ? true : false;
  }

  changeActiveItem(i) {
    this.index = i;
    $('.carousel-indicators').children().each(function(index) {
      if ($(this).hasClass('active')) $(this).removeClass('active');
      if (index === i) $(this).addClass('active');
    });
    this.setControlsActiveness();
  }

  mainImage(annonce) {
    return this.formDataService.mainImage(annonce);
  }

  createConsoChart() {
    const consoMixte = this.annonce['VehiculeConsommationMixte'][0];
    const consoUrbaine = this.annonce['VehiculeConsommationUrbaine'][0];
    const consoExtraUrbaine = this.annonce['VehiculeConsommationExtraUrbaine'][0];
    const mixte = parseInt(consoMixte, 10);
    const urbaine = parseInt(consoUrbaine, 10);
    const extra = parseInt(consoExtraUrbaine, 10);
    const labels = [
      `mixte: ${mixte}L/100 km`,
      `urbaine: ${urbaine}L/100 km`,
      `extra-urbaine: ${extra}L/100 km`
    ];

    const ctx = document.getElementById('consoChart');
    return new Chart(ctx, {
      type: 'bar',
      options: {
        maintainAspectRatio: true,
        responsive: true,
        legend: {
          display: false
        },
        scales: {
          yAxes: [{
            display: true,
            ticks: {
              suggestedMin: 0,
              max: 20
            }
          }]
        }
      },
      data: {
        labels: [labels[0], labels[1], labels[2]],
        datasets: [{
          label: labels[0],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)'
          ],
          data: [mixte, urbaine, extra],
          borderWidth: 1,
          barThickness: 30,
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ]
        }],
        barPercentage: 3
      },
    });
  }

  createFiscaleChart() {
    const powerFisc = this.annonce['VehiculePuissanceFiscale'][0];

    const ctx = document.getElementById('fiscaleChart');
    return new Chart(ctx, {
      type: 'horizontalBar',
      options: {
        maintainAspectRatio: true,
        responsive: true,
        legend: {
          position: 'top'
        },
        scales: {
          xAxes: [{
            display: true,
            ticks: {
              suggestedMin: 0,
              max: 30
            }
          }]
        }
      },
      data: {
        labels: [`${parseInt(powerFisc, 10)} CV`],
        datasets: [{
          label: 'Fiscale',
          barThickness: 30,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          data: [parseInt(powerFisc, 10)],
          borderWidth: 1,
          borderColor: 'rgba(75, 192, 192, 1)'
        }],
        barPercentage: 1
      },
    });
  }

  createReelleChart() {
    const powerReal = this.annonce['VehiculePuissanceReelle'][0];

    const ctx = document.getElementById('reelleChart');
    return new Chart(ctx, {
      type: 'horizontalBar',
      options: {
        maintainAspectRatio: true,
        responsive: true,
        legend: {
          position: 'top'
        },
        scales: {
          xAxes: [{
            display: true,
            ticks: {
              suggestedMin: 0,
              max: 300
            }
          }]
        }
      },
      data: {
        labels: [`${parseInt(powerReal, 10)} Kw`],
        barPercentage: 1,
        datasets: [{
          label: 'Réelle',
          barThickness: 30,
          data: [parseInt(powerReal, 10)],
          backgroundColor: ['rgba(153, 102, 255, 0.2)'],
          borderColor: ['rgba(153, 102, 255, 1)'],
          borderWidth: 1
        }]
      },
    });
  }

  buildOptionsObject() {
    const options = this.annonce['VehiculeEquipementsOptionArgus'][0].split('|');
    const equip = this.annonce['VehiculeEquipementsSerieArgus'][0].split('|');
    const allOptions = _.compact(_.concat(options, equip));
    return _.chunk(allOptions, 2);
  }

  scrollToSides(container, isPrev) {
    const distance = 100;
    const step = 10;

    let scrollLeftValue = container.scrollLeft();
    let scrollAmount = 0;
    const slideTimer = setInterval(() => {
      scrollLeftValue = isPrev ? (scrollLeftValue -= step) : (scrollLeftValue += step);
      container.scrollLeft(scrollLeftValue);
      scrollAmount = scrollAmount += step;
      if (scrollAmount >= distance) window.clearInterval(slideTimer);
    }, 25);
  }

  scrollLeftOrRight(direction) {
    const container = $('.carousel-indicators');
    const containerWidth = container.width();
    const items = container.children();
    const i = this.index;
    if (i < 1) return container.scrollLeft(0);

    const isPrev = direction === 'prev';
    const isFirstOrLast = i < 1 || i >= (_.size(items) - 1);
    const nextIndex = isPrev ? i - 1 : i + 1;
    const index = isFirstOrLast ? i : nextIndex;
    const nextItem = items[index];
    const containerScrollLeft = container.scrollLeft();
    const leftOffset = $(nextItem).offset().left;
    const itemWidth = $(nextItem).width();
    const itemNotNeedScroll = isPrev ?
      (containerScrollLeft < leftOffset) :
      ((leftOffset + itemWidth) < containerWidth);

    if (!nextItem || itemNotNeedScroll) return;

    return this.scrollToSides(container, isPrev);
  }

  watchForActiveClassChange() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName !== 'class') return;
        const item = $(mutation.target);
        const attributeValue = item.prop(mutation.attributeName);
        if (!_.includes(attributeValue, 'active')) return;
        this.index = item.index();
        const direction = item.position().left < 0 ? 'prev' : 'next';
        this.scrollLeftOrRight(direction);
        return this.setControlsActiveness();
      });
    });

    const indicators = $(".carousel-indicators").children();
    indicators.each((i, el) => observer.observe(el, { attributes: true }));
  }

  ngOnDestroy() {
    this.clearEnlarged();
  }

  ngAfterViewInit() {
    this.watchForActiveClassChange();
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams
      .subscribe((params) => {
        this.annonceId = _.get(params, 'id');
      });

    this.annonce = this.activatedRoute.snapshot.data['annonce'];
    this.options = this.buildOptionsObject();
    this.isPrevDisabled = false;
    this.isNextDisabled = true;
    this.index = 0;

    this.createConsoChart();
    this.createFiscaleChart();
    this.createReelleChart();
    this.setControlsActiveness();
  }

}
