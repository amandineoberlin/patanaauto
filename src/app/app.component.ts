import { Component, OnInit } from '@angular/core';

import { BuildVersionCheckService } from './services/build-version-check.service';

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  constructor(
    private buildVersionService: BuildVersionCheckService
  ) { }

  title = 'Patana Auto';

  ngOnInit(): void {
    this.buildVersionService.initVersionCheck();
  }
}
