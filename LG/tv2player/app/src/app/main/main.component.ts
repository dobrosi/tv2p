import {Component, HostListener, inject, ViewChild} from '@angular/core';
import {SiteService} from '../site.service';
import {Site} from "../interface/site";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import webOS from '@volley/webostv'
import {HeaderComponent} from "../header/header.component";
import {GridComponent} from "../grid/grid.component";
import {LoaderComponent} from "../shared/loader/loader.component";
import {VideoComponent} from "../video/video.component";
import {log} from "../util";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  templateUrl: 'main.component.html',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    HeaderComponent,
    GridComponent,
    LoaderComponent,
    NgIf,
  ],
  styleUrls: ['main.component.css']
})
export class MainComponent {
  @ViewChild(GridComponent) grid!: GridComponent
  @ViewChild(HeaderComponent) header!: HeaderComponent
  @ViewChild(VideoComponent) video!: VideoComponent

  private siteService: SiteService = inject(SiteService)
  private searchText: any
  protected loading: any

  constructor() {
    this.search()
  }

  search(text: string | undefined = undefined) {
    this.loading = true
    this.searchText = text
    const load$ = text
      ? this.siteService.search(text)
      : this.siteService.getSite()
    load$.then((site: Site) => {
      this.grid.init(site.siteRows);
      this.grid.unselect = () => this.header.focus();
      this.header.unselect = () => this.grid.select();
      this.loading = false
    })
  }

  back() {
    if (this.searchText) {
      this.header.searchText.nativeElement.value = ''
      this.search()
    } else {
      webOS.service.request(
        "luna://com.webos.applicationManager",
        {
          method: "launch",
          parameters: {
            id: "com.webos.app.home"
          }
        }
      )
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const tagName = document.activeElement?.tagName

    log('k: ' + event.key + ",c:" + event.code + ",f:"+tagName);

    if (tagName === "BUTTON") {
      if (event.key === 'ArrowDown') {
        this.doIt(event, () => this.grid.down())
      } else if (event.key === 'ArrowUp') {
        this.doIt(event, () => this.grid.up())
      } else if (event.key === 'ArrowLeft') {
        this.doIt(event, () => this.grid.left())
      } else if (event.key === 'ArrowRight') {
        this.doIt(event, () => this.grid.right())
      } else if (event.key === 'Enter') {
        this.doIt(event, () => this.grid.clickToItem())
      } else if (event.key === 'Backspace') {
        this.doIt(event, () => this.back())
      }
    } else
    if (tagName === "INPUT") {
      if (event.key === 'ArrowDown') {
   //     this.header.closePanel();
   //     this.doIt(event, () => this.grid.focus())
      }
    }
  }


  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    console.log('URL változott:', location.pathname);
    console.log("state: " + JSON.stringify(event.state))
   // this.search(event.state.text, false)
  }

  private doIt(event: KeyboardEvent, f: () => void) {
    f()
    event.preventDefault();
  }
}

export var videoUrl: string

export function setVideoUrl(url: string) {
  videoUrl = url
}
