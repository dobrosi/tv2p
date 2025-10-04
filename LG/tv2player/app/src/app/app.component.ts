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
    GridComponent
  ],
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  siteService: SiteService = inject(SiteService);

  @ViewChild(GridComponent) grid!: GridComponent;

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
