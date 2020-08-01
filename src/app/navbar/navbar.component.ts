import { Component, OnInit, AfterViewInit } from '@angular/core';
import _ from 'lodash';

import { NavbarOptions } from './navbar-options';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  animations: NavbarOptions.animations,
  host: {
    '(window:resize)': 'onResize($event)'
  }
})

export class NavbarComponent implements OnInit, AfterViewInit {

  constructor() { }

  isShown: boolean;
  isSmallSize: boolean;

  isSmallScreen() {
    return $(window).width() <= 991;
  }

  onResize() {
    const isSmallScreen = this.isSmallScreen();
    this.isSmallSize = isSmallScreen ? true : false;
    this.isShown = false;
  }

  toggle() {
    this.isShown = !this.isShown;
  }

  ngOnInit() {
    const isSmallScreen = this.isSmallScreen();
    if (isSmallScreen) return this.isSmallSize = true;
    this.isShown = false;
  }

  ngAfterViewInit() {
    $('body').click((e) => {
      const target = $(e.target);
      const parents = target.parents();
      const isNotNavbarElement = _.find(parents, p => $(p).hasClass('content'));
      if (!isNotNavbarElement) return;
      return this.isShown = false;
    });
  }
}
