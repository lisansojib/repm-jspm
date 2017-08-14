import { inject, bindable, computedFrom } from 'aurelia-framework';
import { applicationState } from 'applicationState';
import { RouterConfiguration, Router } from 'aurelia-router';

@inject(applicationState)
export class App {

  configureRouter(config, router) {
    config.title = 'Welcome';
    config.map([
      { route: ['', 'listings'], name: 'Listings', moduleId: './listings', nav: true, title: 'Listings' },
      { route: 'find', name: 'Find', moduleId: './listings', nav: true, title: 'Find' },
      { route: 'listings', name: 'Projects', moduleId: './listings', nav: true, title: 'Projects' },
      { route: 'login', name: 'login', moduleId: 'auth/login', nav: false, title: 'Login' },
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