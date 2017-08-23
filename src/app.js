import { inject, bindable, computedFrom } from 'aurelia-framework';
import { applicationState } from 'applicationState';
import { RouterConfiguration, Router } from 'aurelia-router';

@inject(applicationState)
export class App {

    configureRouter(config, router) {
        config.title = 'Welcome';
        config.map([
            { route: ['', 'login'], name: 'Listings', moduleId: 'auth/login', nav: true, title: 'login' },
            { route: 'find', name: 'Find', moduleId: './listings', nav: true, title: 'Find', auth: true },
            { route: 'listings', name: 'Projects', moduleId: './listings', nav: true, title: 'Projects' },
            { route: 'login', name: 'login', moduleId: 'auth/login', nav: false, title: 'Login' }
        ]);

        this.router = router;
    }

    constructor(appState) {
        this.appState = appState;
    }

    attached() {
        // console.log("Main App Attached");
        this.appState.refreshConnection();
        // $(".splash").hide();
    }

    detached() {
        this.ready = false;
    }
}