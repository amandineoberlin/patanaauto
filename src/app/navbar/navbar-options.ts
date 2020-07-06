import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';

export class NavbarOptions {
  public static readonly animations: Array<object> = [
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
}
