import {Component, Input} from '@angular/core';
import {SiteRow} from "../interface/siterow";

import {NgForOf} from "@angular/common";
import {GridItemComponent} from "../griditem/grid-item.component";
import {GridComponent} from "../grid/grid.component";

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
  @Input() parent!: GridComponent;
}
