import {Injectable} from '@angular/core';
import {Site} from "./interface/site";
import {VideoUrl} from "./interface/videourl";

@Injectable({
  providedIn: 'root'
})

export class SiteService {
  getSite(): Promise<Site> {
    return this.get('load')
  }

  search(value: string) {
    return this.get(`search?text=${value}`)
  }

  async get(url: string) {
    history.pushState({}, '', url);
    return await (await fetch(baseUrl + url)).json() ?? [];
  }

  async getUrl(url: string): Promise<VideoUrl> {
    return await (await fetch(baseUrl + 'getVideoUrl?url=' + url)).json();
  }
}

export const baseUrl = "http://localhost:8085/api/"
