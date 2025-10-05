import {Component, inject, Input} from '@angular/core';
import {SiteRow} from "../interface/siterow";
import {SiteItem} from "../interface/siteitem";

import {NgClass, NgForOf} from "@angular/common";
import {GridItemComponent} from "../griditem/grid-item.component";
import {AutofocusDirective} from "../directive/autofocus.driective";
import Hls from "hls.js";
import {SiteService} from "../site.service";
import {AppComponent} from "../app.component";

@Component({
  selector: 'app-gridline',
  standalone: true,
  imports: [
    NgForOf,
    GridItemComponent,
    NgClass,
    AutofocusDirective
  ],
  templateUrl: './grid-line.component.html',
  styleUrl: './grid-line.component.css'
})
export class GridLineComponent {
  @Input() siteRow!: SiteRow

  appComponent: AppComponent = inject(AppComponent);

  async clicked(siteItem: SiteItem) {
    await this.appComponent.playVideo(siteItem)
  }
}
