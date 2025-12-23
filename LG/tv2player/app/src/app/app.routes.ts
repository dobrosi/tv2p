import {Routes} from '@angular/router';
import {VideoComponent} from "./video/video.component";
import {AppComponent} from "./app.component";
import {MainComponent} from "./main/main.component";

export const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'main', component: MainComponent },
  { path: 'search', component: MainComponent },
  { path: 'video', component: VideoComponent },
];
