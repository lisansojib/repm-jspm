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
        debugger;
        this.appState = appState;
        this.authService = authService;
        this.appService = appService;
        localStorage.setItem('route_mapped', false);
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
        var v = this.app.router;
        if (localStorage.getItem('route_mapped') == 'false' || !localStorage.getItem('route_mapped')) {
            localStorage.setItem('route_mapped', true);
            this.updateRoutes();
        } else if (localStorage.getItem('route_mapped') == 'false' || !localStorage.getItem('route_mapped') && (localStorage.getItem('route_loaded') == 'true')) {
            var routeList = JSON.parse(localStorage.getItem('route_list'));
            for (let item of routeList) {
                this.app.router.addRoute(item);
            }
            localStorage.setItem('route_mapped', true);
        }

        if (navigationInstruction.getAllInstructions().some(i => i.config.auth)) {
            if (!this.applicationState.isAuthenticated)
                window.location.href = "#login"; //window.location.href = baseUrl() + "#/login";
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
                localStorage.setItem('route_loaded', true);
                localStorage.setItem('route_list', routes);
                let items = JSON.parse(routes);
                for (let route of items) {
                    if (this.app.router.hasOwnRoute(route.name))
                        continue;

                    this.app.router.addRoute(route);
                    this.app.router.refreshNavigation();
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
}