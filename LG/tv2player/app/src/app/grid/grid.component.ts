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
  siteRows: SiteRow[] = []
  @ViewChild('grid') private gridElement!: ElementRef<HTMLDivElement>
  private rowIndex = 0
  private colIndex = 0

  down() {
    this.rowIndex++
    this.colIndex=0;
    this.select()
  }

  up() {
    this.rowIndex--
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

  select() {
    if (this.rowIndex < 0) {
      this.rowIndex = 0
      this.unselect()
    } else if (this.colIndex < 0) {
      this.colIndex = 0
    } else {
      this.rowIndex = Math.min(this.rowIndex, this.siteRows.length - 1)
      this.colIndex = Math.min(this.colIndex, this.siteRows[this.rowIndex].siteItems.length - 1)
      this.focus()
    }
  }

  focus() {
    const button = this.getButton()
    button.focus()

    button.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
  }

  getButton() {
    return document.querySelectorAll('.row')[this.rowIndex]
      .querySelectorAll('.cell')[this.colIndex] as HTMLButtonElement
  }

  init(siteRows: SiteRow[], key: string | undefined = undefined) {
    this.siteRows = siteRows
    document.body.scroll(0, 0)
    this.rowIndex = 0
    this.colIndex = 0
    setTimeout(() => this.select())
    if (key) {
      history.pushState(siteRows, "", document.location.href)
    }
  }

  unselect() {}

  back() {
    history.back()
  }

}
