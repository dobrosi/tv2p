import {ApplicationConfig} from '@angular/core';
import {provideRouter, RouteReuseStrategy} from '@angular/router';

import {routes} from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {CustomReuseStrategy} from "./custom-reuse-strategy";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimationsAsync(), { provide: RouteReuseStrategy, useClass: CustomReuseStrategy }],
};
