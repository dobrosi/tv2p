import {Component, inject, ViewChild} from '@angular/core';
import {SiteService} from './site.service';
import {RouterOutlet} from "@angular/router";
import {Site} from "./interface/site";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {HeaderComponent} from "./header/header.component";
import {GridComponent} from "./grid/grid.component";
import {SiteItem} from "./interface/siteitem";
import Hls from "hls.js";
import {VideoComponent} from "./video/video.component";
import {NgIf} from "@angular/common";

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
    HeaderComponent,
    GridComponent,
    VideoComponent,
    NgIf
  ],
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  siteService: SiteService = inject(SiteService);

  @ViewChild(GridComponent) grid!: GridComponent;

  showVideo = false;

  async playVideo(siteItem: SiteItem) {
    console.log("clicked" + siteItem.url);
    const video = document.getElementById('videoPlayer') as HTMLVideoElement;

    const url = await this.siteService.getUrl(siteItem.url);
    console.log(url);

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url.value);
      hls.attachMedia(video);
      hls.startLoad();
    } else {
      video.src = url.value;
    }
    this.showVideo = true;
  }

  constructor() {
    this.siteService.getSite().then((site: Site) => {
      this.grid.siteRows = site.siteRows
    });
  }

  search(text: string) {
    this.siteService.search(text).then((site: Site) => {
      this.grid.init(site.siteRows)
    });
  }
}
