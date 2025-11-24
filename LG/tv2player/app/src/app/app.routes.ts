import {Routes} from '@angular/router';
import {VideoComponent} from "./video/video.component";
import {AppComponent} from "./app.component";

export const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'video', component: VideoComponent },
];
