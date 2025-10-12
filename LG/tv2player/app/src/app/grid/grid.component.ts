import {Component, ElementRef, ViewChild} from '@angular/core';
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
  @ViewChild('grid') gridElement!: ElementRef<HTMLDivElement>;

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
    if (this.rowIndex >= 0) {
      this.select()
    } else {
      this.rowIndex = 0
      this.unselect()
    }
  }

  right() {
    this.colIndex++
    this.select()
  }

  left() {
    this.colIndex--
    this.select()
  }

  select() {
    this.rowIndex = Math.min(this.rowIndex, this.siteRows.length - 1)
    this.rowIndex = Math.max(this.rowIndex, 0)
    this.colIndex = Math.min(this.colIndex, this.siteRows[this.rowIndex].siteItems.length - 1)
    this.colIndex = Math.max(this.colIndex, 0)
    this.focus()
  }

  unselect() {

  }

  focus() {
    const button = document.querySelectorAll('.row')[this.rowIndex]
      .querySelectorAll('.cell')[this.colIndex] as HTMLButtonElement;
    button.focus()

    button.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
  }

  init(siteRows: SiteRow[]) {
    this.siteRows = siteRows
    document.body.scroll(0, 0)
    this.rowIndex = 0
    this.colIndex = 0
    setTimeout(() => this.select())
  }
}
