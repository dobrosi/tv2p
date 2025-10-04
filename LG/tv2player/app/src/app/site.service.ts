import {Injectable} from '@angular/core';
import {Site} from "./interface/site";

@Injectable({
  providedIn: 'root'
})
export class SiteService {

  url: string = "http://localhost:8085/tv2/"

  getSite(): Promise<Site> {
    return this.get('get')
  }

  search(value: string) {
    return this.get(`search?text=${value}`)
  }

  async get(url: string) {
    history.pushState({}, '', url);
    return await (await fetch(this.url + url)).json() ?? [];
  }
}
