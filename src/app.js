import { inject, bindable, computedFrom } from 'aurelia-framework';
import { applicationState } from 'applicationState';
import { RouterConfiguration, Router } from 'aurelia-router';
import { AuthenticateStep, AuthService } from 'aurelia-authentication';
import { baseUrl } from 'resources/utilities/utilities';
import { AppService } from 'appService';

@inject(applicationState, AuthService, AppService)
export class App {
    routeList = [];
    baseRoutes = [
        { route: '', name: 'login', moduleId: 'auth/login', nav: false, title: 'Login' },
        { route: 'login', name: 'login', moduleId: 'auth/login', nav: false, title: 'Login' }
    ]

    constructor(appState, authService, appService) {
        this.appState = appState;
        this.authService = authService;
        this.appService = appService;
    }

    configureRouter(config, router) {
        config.title = 'Welcome';
        config.addPipelineStep('authorize', AuthorizeStep);
        config.mapUnknownRoutes('not-found');
        // config.map([
        //     { route: ['', 'login'], name: 'login', moduleId: 'auth/login', nav: false, title: 'Login' }
        // ]);

        this.router = router;

        for (let route of this.baseRoutes) {
            this.router.addRoute(route);
        }

        for (let route of this.routeList) {
            this.router.addRoute(route);
        }

        this.router.refreshNavigation();
    }

    activate() {
        let session_token = "";
        if (localStorage.getItem('session_token'))
            session_token = localStorage.getItem('session_token');
        let url = `routes?token=${session_token}`;
        this.appService.httpClient
            .fetch(url, {
                method: 'get'
            })
            .then(response => response.json())
            .then(routes => {
                this.routeList = JSON.parse(routes);
            })
            .catch(error => {
                console.log(error);
            });
    }

    attached() {
        this.appState.refreshConnection();
    }

    detached() {
        this.ready = false;
    }

    logout() {
        let logoutRedirect = 'http://localhost:52377/ra2/ra-web//#login';
        this.authService.logout(logoutRedirect)
            .then(response => {
                localStorage.removeItem('session_token');
            })
            .catch(err => {
                console.log("error logged out");
            });
    }
}

@inject(applicationState)
class AuthorizeStep {
    constructor(applicationState) {
        this.applicationState = applicationState;
    }

    run(navigationInstruction, next) {
        if (navigationInstruction.getAllInstructions().some(i => i.config.auth)) {
            if (!this.applicationState.isAuthenticated)
                window.location.href = "#/login"; //window.location.href = baseUrl() + "#/login";
        }

        return next();
    }
}