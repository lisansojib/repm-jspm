import { inject, bindable, computedFrom } from 'aurelia-framework';
import { applicationState } from 'applicationState';
import { RouterConfiguration, Router } from 'aurelia-router';
import { AuthenticateStep, AuthService } from 'aurelia-authentication';
import { baseUrl } from 'resources/utilities/utilities';
import { AppService } from 'appService';

@inject(applicationState, AuthService, AppService)
export class App {
    routeList = [];

    constructor(appState, authService, appService) {
        this.appState = appState;
        this.authService = authService;
        this.appService = appService;
    }

    configureRouter(config, router) {
        config.title = 'Welcome';
        this.router = router;
        config.addAuthorizeStep(AuthorizeStep);
        config.mapUnknownRoutes('not-found');
        config.map({ route: ['', 'login'], name: 'login', moduleId: 'auth/login', nav: false, title: 'Login' });
    }

    activate() {}

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

@inject(applicationState, AppService, App)
class AuthorizeStep {
    routeList = [];

    constructor(applicationState, appService, app) {
        this.applicationState = applicationState;
        this.appService = appService;
        this.app = app;
    }

    run(navigationInstruction, next) {
        debugger;
        this.updateRoutes();

        if (navigationInstruction.getAllInstructions().some(i => i.config.auth)) {
            if (!this.applicationState.isAuthenticated)
                window.location.href = "#/login"; //window.location.href = baseUrl() + "#/login";
        }

        return next();
    }

    updateRoutes() {
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
                debugger;
                let items = JSON.parse(routes);
                for (let route of items) {
                    debugger;
                    if (this.app.router.hasOwnRoute(route.name))
                        continue;
                    // if (this.app.router.hasOwnRoute(route.name)) {
                    //     var existingRout = this.app.router.find(x => x.name == route.name);
                    //     debugger;
                    //     existingRout.roles = route.roles;
                    //     existingRout.nav = route.nav;
                    //     this.app.router.refreshNavigation();
                    //     continue;
                    // }
                    this.app.router.addRoute(route);
                    this.app.router.refreshNavigation();
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
}