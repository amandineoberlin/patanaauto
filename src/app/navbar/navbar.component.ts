import { Component, OnInit } from '@angular/core';
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

export class NavbarComponent implements OnInit {

  constructor() { }

  isShown: boolean;
  isSmallSize: boolean;

  isSmallScreen() {
    return $(window).width() <= 991;
  }

  onResize() {
    const isSmallScreen = this.isSmallScreen();

    this.isSmallSize = isSmallScreen ? true : false;
    this.isShown = isSmallScreen ? false : true;
  }

  toggle() {
    this.isShown = !this.isShown;
  }

  ngOnInit() {
    const isSmallScreen = this.isSmallScreen();

    if (isSmallScreen) {
      this.isSmallSize = true;
      this.isShown = false;
      return;
    }

    this.isShown = true;
  }
}
