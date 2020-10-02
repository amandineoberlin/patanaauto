import { Component, OnInit } from '@angular/core';

import { VersionCheckService } from './services/version-check.service';

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  constructor(
    private versionService: VersionCheckService
  ) { }

  title = 'Patana Auto';

  ngOnInit(): void {
    this.versionService.initVersionCheck();
  }
}
