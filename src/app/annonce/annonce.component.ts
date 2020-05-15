import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Chart from 'chart.js';

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
    private dataLoaderService: DataLoaderService
  ) { }

  annonceId: number;
  annonce: any;
  options: object;

  enlargeImage() {
    if ($('.enlarged-img').length) return;

    const image = $('#annonceCarousel .active').find('img');
    if (!image) return;

    $('body')
      .prepend(`<div class="d-flex justify-content-center enlarged-img">` +
        `<div class="cloned-img-container">` +
        `<i class="fa fa-times-circle cloned-img-icon" (click)="clearEnlarged()"></i>` +
        `<img class="cloned-img" src="../../assets/selsia-photos/${image.attr('src')}"></div></div>`)

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

  changeActiveItem(i) {
    $('.carousel-indicators').children().each(function(index) {
      if ($(this).hasClass('active')) $(this).removeClass('active');
      if (index === i) $(this).addClass('active');
    });
  }

  mainImage(annonce) {
    return this.dataLoaderService.mainImage(annonce);
  }

  createConsoChart() {
    const consoMixte = this.annonce['VehiculeConsommationMixte'][0];
    const consoUrbaine = this.annonce['VehiculeConsommationMixte'][0];
    const consoExtraUrbaine = this.annonce['VehiculeConsommationMixte'][0];
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
      type: 'horizontalBar',
      options: {
        maintainAspectRatio: true,
        responsive: true,
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            display: true,
            ticks: {
              suggestedMin: 3,
              max: 12
            }
          }]
        }
      },
      data: {
        labels,
        barPercentage: 3,
        datasets: [{
          barThickness: 30,
          data: [mixte, urbaine, extra],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1
        }]
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
          display: false,
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
        labels: [`fiscale: ${powerFisc}cv`],
        barPercentage: 1,
        datasets: [{
          barThickness: 30,
          data: [parseInt(powerFisc, 10)],
          backgroundColor: ['rgba(75, 192, 192, 0.2)'],
          borderColor: ['rgba(75, 192, 192, 1)'],
          borderWidth: 1
        }]
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
          display: false,
        },
        scales: {
          xAxes: [{
            display: true,
            ticks: {
              suggestedMin: 0,
              max: 200
            }
          }]
        }
      },
      data: {
        labels: [`réelle: ${powerReal}ch`],
        barPercentage: 1,
        datasets: [{
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
    const allOptions = _.concat(options, equip);

    const part1 = [];
    const part2 = [];
    _.forEach(allOptions, o =>
      _.indexOf(allOptions, o) % 2 === 0 ? part1.push({ pair: o }) : part2.push({ impair: o }));

    const longest = part1.length > part2.length ? part1 : part2;
    const shortest = part1.length <= part2.length ? part1 : part2;

    return _.map(longest, (item, index) => ({ ...item, ...shortest[index] }));
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams
      .subscribe((params) => {
        this.annonceId = _.get(params, 'id');
      });

    this.annonce = this.activatedRoute.snapshot.data['annonce'];

    this.options = this.buildOptionsObject();

    this.createConsoChart();
    this.createFiscaleChart();
    this.createReelleChart();

    // @ts-ignore
    $('#annonceCarousel').carousel({ pause: false });
  }

}
