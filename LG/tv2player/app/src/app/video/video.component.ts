import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild} from '@angular/core';
import Hls from "hls.js";
import {OverlayService} from "../overlay.service";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-video',
  standalone: true,
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer') private videoRef!: ElementRef<HTMLVideoElement>;

  private url: string | undefined;

  private overlayServiceSubscription?: Subscription

  private routerSub?: Subscription;

  private video?: HTMLVideoElement

  constructor(
      private overlayService: OverlayService,
      private router: Router) {
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      this.close()
    }
  }

  ngAfterViewInit() {
    history.pushState(null, '', location.href + '#video');
    this.overlayServiceSubscription = this.overlayService.visible$.subscribe((url) => this.url = url);
    this.routerSub = this.router.events.subscribe(event => {
      if (event.type >= 8) {
        this.close()
      }
    });

    this.video = this.videoRef.nativeElement;
    if (this.url) {
      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(this.url)
        hls.attachMedia(this.video)
        hls.startLoad()
      } else {
        this.video.src = this.url
      }
    } else {
      this.video.pause();
    }
  }

  ngOnDestroy() {
    this.video?.pause()
   this.routerSub?.unsubscribe();
   this.overlayServiceSubscription?.unsubscribe()
  }

  private close() {
    console.log('Back gomb a MyComponent-ben!');
    this.overlayService.hide()
  }
}
