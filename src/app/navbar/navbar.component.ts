import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  animations: [
    trigger('toggle', [
      state('open',
      style({
        'max-height': '500px',
        'opacity': '1',
        'visibility': 'visible'
      })),
      state('closed',
      style({ 
        'max-height': '0px',
        'opacity': '0',
        'visibility': 'hidden'
      })),
      transition('open => closed', [
        animate('200ms ease-in-out',
        style({
          'opacity': '0'
        })),
        animate('300ms ease-in-out',
        style({
          'max-height': '0px'
        })),
        animate('50ms ease-in-out',
        style({
          'visibility': 'hidden'
        }))
      ]),
      transition('closed => open', [
        animate('1ms ease-in-out',
        style({
          'visibility': 'visible'
        })),
        animate('300ms ease-in-out',
        style({
          'max-height': '500px'
        })),
        animate('200ms ease-in-out',
        style({
          'opacity': '1'
        }))
      ])
    ])
  ]
})

export class NavbarComponent implements OnInit {

  constructor() { }

  isShown: boolean;

  toggle() {
    this.isShown = !this.isShown;
  }

  ngOnInit() {
    this.isShown = false;
  }
}
