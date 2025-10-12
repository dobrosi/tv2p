import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild} from '@angular/core';
import Hls from "hls.js";
import {OverlayService} from "../overlay.service";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {VideoUrl} from "../interface/videourl";

@Component({
  selector: 'app-video',
  standalone: true,
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer') private videoRef!: ElementRef<HTMLVideoElement>;

  private url: Promise<VideoUrl> | undefined;

  private overlayServiceSubscription?: Subscription

  private routerSub?: Subscription;

  private video?: HTMLVideoElement


  private lastFocusedElement: HTMLElement | undefined | null

  constructor(
      private overlayService: OverlayService,
      private router: Router) {
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      this.close()
    } else if (event.key === 'Space') {
      this.playPause()
    }
  }

  async ngAfterViewInit() {
    history.pushState(null, '', "video");
    this.overlayServiceSubscription = this.overlayService.visible$.subscribe((o) => this.url = o.payload);
    this.routerSub = this.router.events.subscribe(event => {
      if (event.type >= 8) {
        this.close()
      }
    });

    this.video = this.videoRef.nativeElement;
    this.lastFocusedElement = document.activeElement as HTMLElement | null;
    this.video.requestFullscreen().then(() => {})
    this.video.focus()
    this.video.addEventListener('ended', () => {
      this.close();
    });

    if (this.url) {
      const url = (await this.url).value as string;
      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(url)
        hls.attachMedia(this.video)
        hls.startLoad()
      } else {
        this.video.src = url
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
    this.overlayService.hide(this.lastFocusedElement)
  }

  private playPause() {
    this.video?.paused ? this.video?.play() : this.video?.pause()
  }
}
