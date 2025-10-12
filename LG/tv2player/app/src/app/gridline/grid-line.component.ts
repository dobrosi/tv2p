import {Component, inject, Input} from '@angular/core';
import {SiteRow} from "../interface/siterow";
import {SiteItem} from "../interface/siteitem";

import {NgForOf} from "@angular/common";
import {GridItemComponent} from "../griditem/grid-item.component";
import {SiteService} from "../site.service";
import {OverlayService} from "../overlay.service";

@Component({
  selector: 'app-gridline',
  standalone: true,
  imports: [
    NgForOf,
    GridItemComponent
  ],
  templateUrl: './grid-line.component.html',
  styleUrl: './grid-line.component.css'
})
export class GridLineComponent {
  @Input() siteRow!: SiteRow

  siteService: SiteService = inject(SiteService);
  overlayService: OverlayService = inject(OverlayService);

  async clicked(siteItem: SiteItem) {
    this.overlayService.show(this.siteService.getUrl(siteItem.url))
  }
}
