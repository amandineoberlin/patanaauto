import { Component } from '@angular/core';

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Patana Auto';

  ngOnInit() {
    document.createElement('ui-select');
    document.createElement('ui-select-match');
    document.createElement('ui-select-choices');
  }
}
