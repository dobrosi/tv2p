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

  search(value: string) : Promise<Site> {
    return this.get(`search?text=${value}`)
  }

  async get(url: string) {
    return await (await fetch(baseUrl + url)).json() ?? [];
  }

  async getUrl(url: string): Promise<VideoUrl> {
    return (await fetch(baseUrl + 'getVideoUrl?url=' + url)).json();
  }
}

export const baseUrl = document.location.href.includes("localhost") ?
  "http://localhost:8085/tv2/api/" : "https://pgy.no-ip.hu/tv2/api/"
