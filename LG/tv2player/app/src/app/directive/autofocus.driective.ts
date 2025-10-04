import {Directive, ElementRef, Input, OnChanges, SimpleChanges} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appAutofocus]'
})
export class AutofocusDirective implements OnChanges {
  @Input() appAutofocus!: boolean;
  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appAutofocus'] && this.appAutofocus) {
      setTimeout(() => {
        this.el.nativeElement.focus();
      });
    }
  }
}
