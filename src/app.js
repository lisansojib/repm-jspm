import { inject, bindable, computedFrom } from 'aurelia-framework';
import { applicationState } from 'applicationState';
import { RouterConfiguration, Router } from 'aurelia-router';
import { AuthenticateStep, AuthService } from 'aurelia-authentication';
import { baseUrl } from 'resources/utilities/utilities';

@inject(applicationState, AuthService)
export class App {
    constructor(appState, authService) {
        this.appState = appState;
        this.authService = authService;
    }

    configureRouter(config, router) {
        config.title = 'Welcome';
        config.addPipelineStep('authorize', AuthorizeStep);
        config.map([
            { route: ['', 'login'], name: 'login', moduleId: 'auth/login', nav: true, title: 'login' },
            { route: 'find', name: 'Find', moduleId: './listings', nav: true, title: 'Find', auth: true },
            { route: 'listings', name: 'Projects', moduleId: './listings', nav: true, title: 'Projects', auth: true },
            { route: 'login', name: 'login', moduleId: 'auth/login', nav: false, title: 'Login' }
        ]);

        this.router = router;
    }

    attached() {
        this.appState.refreshConnection();
    }

    detached() {
        this.ready = false;
    }
}

@inject(applicationState)
class AuthorizeStep {
    constructor(applicationState) {
        this.applicationState = applicationState;
    }

    run(navigationInstruction, next) {
        if (navigationInstruction.getAllInstructions().some(i => i.config.auth)) {
            debugger;
            if (!this.applicationState.isAuthenticated)
                window.location.href = "#/login"; //window.location.href = baseUrl() + "#/login";
        }

        return next();
    }
}