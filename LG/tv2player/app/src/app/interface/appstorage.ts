import {Store} from "./store";

export class Appstorage {
  static store: Store;

  history: any[];

  constructor(history: any[]) {
    this.history = history;
  }

  static get(): Store {
    if (this.store) {
      return this.store
    }
    this.store = {history: []};
    const raw = localStorage.getItem('storage');
    if (raw) {
      try {
        this.store = JSON.parse(raw) as Store
      } catch (e) {
        console.error('Hibás JSON:', e);
      }
    }
    return this.store;
  }

  static save() {
    localStorage.setItem('storage', JSON.stringify(this.store))
  }
}
