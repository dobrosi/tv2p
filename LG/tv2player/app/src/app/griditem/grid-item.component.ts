import {Component, Input} from '@angular/core';
import {SiteItem} from "../interface/siteitem";

@Component({
  selector: 'app-griditem',
  standalone: true,
  imports: [],
  templateUrl: './grid-item.component.html',
  styleUrl: './grid-item.component.css'
})
export class GridItemComponent {
  @Input() siteItem!: SiteItem;

  select() {
    console.log(this.siteItem)
  }

  unselect() {

  }
}
