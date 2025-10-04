import {Component, Input} from '@angular/core';
import {SiteRow} from "../interface/siterow";
import {NgClass, NgForOf} from "@angular/common";
import {GridItemComponent} from "../griditem/grid-item.component";
import {AutofocusDirective} from "../directive/autofocus.driective";

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
}
