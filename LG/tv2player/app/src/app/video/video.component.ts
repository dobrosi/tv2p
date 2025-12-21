import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import Hls from "hls.js";

import {VideoUrl} from "../interface/videourl";
import {videoUrl} from "../main/main.component";

@Component({
  standalone: true,
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer') private videoRef!: ElementRef<HTMLVideoElement>;
  private video?: HTMLVideoElement

  async ngAfterViewInit() {
    await this.play(videoUrl)
  }

  ngOnDestroy() {
    this.video?.pause()
  }

  async play(urlPromise: Promise<VideoUrl> | undefined) {
    this.video = this.videoRef.nativeElement;
    this.video.requestFullscreen().then(() => {})
    this.video.focus()
    this.video.controls = false

    if (urlPromise) {
      const result = await urlPromise;

      console.log(result)

      if (!result?.value) {
        throw new Error('URL is missing');
      }

      const url = result.value;
      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(url)
        hls.attachMedia(this.video)
        hls.startLoad()
        hls.createController({}, {})
      } else {
        this.video.src = url
      }
    } else {
      this.video.pause();
    }
  }

  close() {
    history.back()
  }

  private playPause() {
    this.video?.paused ? this.video?.play() : this.video?.pause()
  }

  onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Space') {
        this.playPause()
      } else if (event.key === 'Escape' || event.key === 'Backspace') {
        this.video?.pause()
        this.close()
      }
  }
}
