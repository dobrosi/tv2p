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
import {OverlayService} from "./overlay.service";
import {NgIf} from "@angular/common";
import {HeaderComponent} from "./header/header.component";
import {log} from "./util";

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
    VideoComponent,
    NgIf,
    HeaderComponent
  ],
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  siteService: SiteService = inject(SiteService);

  @ViewChild(GridComponent) grid!: GridComponent;
  @ViewChild(HeaderComponent) header!: HeaderComponent

  visibleVideo = false;

  constructor(private overlayService: OverlayService) {
    this.overlayService.visible$.subscribe((o) => {
      this.visibleVideo = o.show

      const payload = o.payload
      if (payload instanceof HTMLElement) {
        setTimeout(() => this.grid.focus())
      }
    })

    this.siteService.getSite().then((site: Site) => {
      this.grid.init(site.siteRows, "/")
      this.grid.unselect = () => this.header.focus()
      this.header.unselect = () => this.grid.select()
    });
  }

  search(text: string) {
    this.siteService.search(text).then((site: Site) => {
      this.grid.init(site.siteRows, "/search?text=" + text)
    });
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    log('Gomb key: ' + event.key + ", code: " + event.code);
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    console.log('URL változott:', location.pathname);
    console.log("state: " + JSON.stringify(event.state))
    if (event.state) {
      this.grid.init(event.state)
    }
  }
}
