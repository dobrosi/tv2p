import {Component, inject, Input} from '@angular/core';
import {SiteRow} from "../interface/siterow";
import {SiteItem} from "../interface/siteitem";

import {NgClass, NgForOf} from "@angular/common";
import {GridItemComponent} from "../griditem/grid-item.component";
import {AutofocusDirective} from "../directive/autofocus.driective";
import {SiteService} from "../site.service";
import {OverlayService} from "../overlay.service";

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

  siteService: SiteService = inject(SiteService);
  overlayService: OverlayService = inject(OverlayService);

  async clicked(siteItem: SiteItem) {
    const url = (await this.siteService.getUrl(siteItem.url)).value;
    console.log("URL:" + url);
    this.overlayService.show(url)
  }
}
