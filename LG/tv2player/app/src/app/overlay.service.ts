import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OverlayService {
  private visibleSource = new BehaviorSubject<OverlayControl>({show: false, payload: undefined});
  visible$ = this.visibleSource.asObservable();

  show(payload: any | null) { this.visibleSource.next({show: true, payload: payload}); }
  hide(payload: any | null) { this.visibleSource.next({show: false, payload: payload}); }
}

interface OverlayControl {
  show: boolean
  payload: any | null
}
