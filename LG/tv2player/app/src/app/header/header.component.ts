import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {Appstorage} from "../interface/appstorage";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    FormsModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormField,
    MatInput,
    MatOption,
    ReactiveFormsModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  MAX_SEARCH_SIZE = 10;

  @Output() clicked = new EventEmitter<string>()

  @ViewChild('searchText') searchText!: ElementRef<HTMLInputElement>

  myControl = new FormControl('')

  options: any;

  startSearch() {
    this.options = Appstorage.get().history
    this.searchText.nativeElement.focus()
  }

  search() {
    let v: any = this.searchText.nativeElement.value
    let options = Appstorage.get().history ?? []
    this.clicked.emit(v)
    if (options.indexOf(v) < 0) {
      options.unshift(v)
    }
    if (options.length > this.MAX_SEARCH_SIZE) {
      options.pop()
    }
    this.options = options
    Appstorage.get().history = options
    Appstorage.save()
  }
}
