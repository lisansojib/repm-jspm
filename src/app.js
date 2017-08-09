import 'bootstrap';
import { inject, bindable, computedFrom } from 'aurelia-framework';
import { applicationState } from 'applicationState';
import { RouterConfiguration, Router } from 'aurelia-router';

@inject(applicationState)
export class App {

  configureRouter(config, router) {
    config.title = 'Welcome';
    config.map([
      { route: ['', 'Listings'], name: 'Listings', moduleId: './listings', nav: true, title: 'Listings' },
      { route: 'Find', name: 'Find', moduleId: './listings', nav: true, title: 'Find' },
      { route: 'Listings', name: 'Projects', moduleId: './listings', nav: true, title: 'Projects' },
    ]);

    this.router = router;
  }

  constructor(appState) {
    this.appState = appState;
  }

  refreshConnection() {
    this.appState.refreshConnection();
  }

  attached() {
    console.log("Main App Attached");
    this.refreshConnection();
    $(".splash").hide();
  }

  activate() {
    //this.fetchConfig.configure();
  }

  message = 'Welcome to Aurelia!';
}