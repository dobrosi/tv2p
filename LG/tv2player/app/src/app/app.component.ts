import {Component, HostListener, inject, ViewChild} from '@angular/core';
import {SiteService} from './site.service';
import {RouterOutlet} from "@angular/router";
import {Site} from "./interface/site";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {GridComponent} from "./grid/grid.component";
import {VideoComponent} from "./video/video.component";
import {HeaderComponent} from "./header/header.component";
import {log} from "./util";
import {VideoUrl} from "./interface/videourl";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    GridComponent,
    HeaderComponent
  ],
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(GridComponent) grid!: GridComponent
  @ViewChild(HeaderComponent) header!: HeaderComponent
  @ViewChild(VideoComponent) video!: VideoComponent
  siteService: SiteService = inject(SiteService)

  constructor() {
    this.siteService.getSite().then((site: Site) => {
      this.grid.init(site.siteRows, "/")
      this.grid.unselect = () => this.header.focus()
      this.header.unselect = () => this.grid.select()
    })
  }


  search(text: string) {
    this.siteService.search(text).then((site: Site) => {
      this.grid.init(site.siteRows, "/search?text=" + text)
    });
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const tagName = document.activeElement?.tagName

    log('k: ' + event.key + ",c:" + event.code + ",f:"+tagName);
    if (event.key === 'Backspace') {
      history.back()
    }

    if (tagName === "BUTTON") {
      if (event.key === 'ArrowDown') {
        this.grid.down()
      } else if (event.key === 'ArrowUp') {
        this.grid.up()
      } else if (event.key === 'ArrowLeft') {
        this.grid.left()
      } else if (event.key === 'ArrowRight') {
        this.grid.right()
      } else if (event.key === 'Enter') {
        this.grid.clickToItem()
      }
    } else
    if (tagName === "INPUT") {
      if (event.key === 'ArrowDown') {
        this.grid.focus()
      }
    }
    event.preventDefault();
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    console.log('URL változott:', location.pathname);
    console.log("state: " + JSON.stringify(event.state))
  }
}

export var videoUrl: Promise<VideoUrl>

export function setVideoUrl(url: Promise<VideoUrl>) {
  videoUrl = url
}
