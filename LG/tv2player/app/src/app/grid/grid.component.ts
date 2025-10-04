import {Component} from '@angular/core';
import {SiteRow} from "../interface/siterow";
import {NgForOf} from "@angular/common";
import {GridLineComponent} from "../gridline/grid-line.component";

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [
    NgForOf,
    GridLineComponent
  ],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.css'
})
export class GridComponent {
  siteRows: SiteRow[] = []

  rowIndex = 0
  colIndex = 0

  down() {
    this.rowIndex++
    this.colIndex=0;
    this.select()
  }

  up() {
    this.rowIndex--
    this.colIndex=0;
    this.select()
  }

  right() {
    this.colIndex++
    this.select()
  }

  left() {
    this.colIndex--
    this.select()
  }

  private select() {
    this.rowIndex = Math.min(this.rowIndex, this.siteRows.length - 1)
    this.rowIndex = Math.max(this.rowIndex, 0)
    this.colIndex = Math.min(this.colIndex, this.siteRows[this.rowIndex].siteItems.length - 1)
    this.colIndex = Math.max(this.colIndex, 0)
    this.siteRows.forEach((siteRow: SiteRow) => this.unselectItems(siteRow))
    this.selectItem(this.siteRows[this.rowIndex], this.colIndex)
  }

  private unselectItems(siteRow: SiteRow) {
    siteRow.siteItems.forEach(i => i.selected = false)
  }

  private selectItem(siteRow: SiteRow, colIndex: number) {
    siteRow.siteItems[colIndex].selected = true
  }

  init(siteRows: SiteRow[]) {
    this.siteRows = siteRows
    document.body.scroll(0, 0)
    this.rowIndex = 0
    this.colIndex = 0
    this.select()
  }
}
