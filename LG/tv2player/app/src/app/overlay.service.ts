import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OverlayService {
  private visibleSource = new BehaviorSubject<string | undefined>(undefined);
  visible$ = this.visibleSource.asObservable();

  show(url: string) { this.visibleSource.next(url); }
  hide() { this.visibleSource.next(undefined); }
}
