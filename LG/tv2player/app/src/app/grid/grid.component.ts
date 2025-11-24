import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {SiteRow} from "../interface/siterow";
import {NgForOf} from "@angular/common";
import {GridLineComponent} from "../gridline/grid-line.component";
import {SiteService} from "../site.service";
import {SiteItem} from "../interface/siteitem";
import {setVideoUrl} from "../app.component";
import {NavigationStart, Router} from "@angular/router";
import {Subscription} from "rxjs";

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
export class GridComponent implements OnInit, OnDestroy {
  private router = inject(Router)
  siteService: SiteService = inject(SiteService);
  siteRows: SiteRow[] = []
  private rowIndex = 0
  private colIndex = 0
  private focusedElement: HTMLElement | null | undefined
  private button: HTMLButtonElement | null | undefined
  private sub: Subscription | undefined;

  ngOnInit() {
    this.sub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart && event.navigationTrigger === 'popstate') {
        setTimeout(() => {
          this.focusedElement?.focus()
        })
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

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

  clickToItem() {
    console.log(this.focusedElement)
    this.button?.click()
  }

  async selectItem(siteItem: SiteItem) {
    this.focusedElement = document.activeElement as HTMLElement
    setVideoUrl(this.siteService.getUrl(siteItem.url))
    await this.router.navigate(["/video"])
  }

  focus() {
    this.button = this.getButton()
    this.button.focus()

    this.button.scrollIntoView({
      behavior: 'instant',
      block: 'nearest',
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
}
