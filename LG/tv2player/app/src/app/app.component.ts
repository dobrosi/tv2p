import {Component, inject, ViewChild} from '@angular/core';
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
    NgIf
  ],
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  siteService: SiteService = inject(SiteService);

  @ViewChild(GridComponent) grid!: GridComponent;

  visibleVideo = false;

  constructor(private overlayService: OverlayService) {
    this.overlayService.visible$.subscribe((url) => this.visibleVideo = url != undefined);

    this.siteService.getSite().then((site: Site) => {
      this.grid.siteRows = site.siteRows
      this.grid.select()
    });
  }

  search(text: string) {
    this.siteService.search(text).then((site: Site) => {
      this.grid.init(site.siteRows)
    });
  }
}
