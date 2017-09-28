import { inject, bindable, computedFrom } from 'aurelia-framework';
import { applicationState } from 'applicationState';
import { RouterConfiguration, Router } from 'aurelia-router';
import { AuthenticateStep, AuthService } from 'aurelia-authentication';
import { baseUrl } from 'resources/utilities/utilities';
import { AppService } from 'appService';

@inject(applicationState, AuthService, AppService)
export class App {
    baseUrl = "http://localhost:52377/ra2/ra-web";
    defaultRoutes = [
        { route: '', name: 'login', moduleId: 'auth/login', nav: false, title: 'Login', href: "#home", auth: false },
        { route: 'login', name: 'login', moduleId: 'auth/login', nav: false, title: 'Login', href: "#home", auth: false },
        { route: "home", name: "Home", moduleId: "./home", nav: true, title: "Home", href: "#home", auth: false },
        { route: "about", name: "About", moduleId: "./about", nav: true, title: "About Us", href: "#about", auth: false },
        { route: "contact", name: "Contact", moduleId: "./contact", nav: true, title: "Contact Us", href: "#contact", auth: false }
    ];

    constructor(appState, authService, appService) {
        this.appState = appState;
        this.authService = authService;
        this.appService = appService;
        if (!localStorage.getItem('app_loaded')) {
            localStorage.setItem('route_list', JSON.stringify(this.defaultRoutes));
            localStorage.setItem('route_loaded', false);
            localStorage.setItem('app_loaded', true);
        }

        this.appState.refreshConnection();
    }

    configureRouter(config, router) {
        config.title = 'Welcome';
        config.baseUrl = this.baseUrl;
        this.router = router;
        let routeList = JSON.parse(localStorage.getItem('route_list'));
        config.addAuthorizeStep(AuthorizeStep);
        config.mapUnknownRoutes('not-found');
        config.map(routeList);
    }

    activate() {}

    attached() {}

    detached() {
        this.ready = false;
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
                this.routeList = JSON.parse(routes);

                this.router.navigation = [];
                this.router.routes = [];
                for (let route of this.routeList) {
                    this.router.addRoute(route);
                    this.router.refreshNavigation();
                }
                this.router.baseUrl = this.baseUrl;
            })
            .catch(error => {
                console.log(error);
            });
    }

    logout() {
        let logoutRedirect = `${this.baseUrl}#login`;
        this.authService.logout(logoutRedirect)
            .then(response => {
                localStorage.removeItem('session_token');
            })
            .catch(err => {
                console.log("error logged out");
            });
    }

    refreshConnection() {
        this.appState.refreshConnection();
    }
}

@inject(applicationState, App)
class AuthorizeStep {
    routeList = [];
    constructor(applicationState, app) {
        this.applicationState = applicationState;
        this.app = app;
    }

    run(navigationInstruction, next) {
        if (localStorage.getItem('route_loaded') == 'false') {
            this.app.updateRoutes();
        }

        if (navigationInstruction.getAllInstructions().some(i => i.config.auth)) {
            if (!this.applicationState.isAuthenticated)
                window.location.href = `${this.app.baseUrl}#login`;
        }

        return next();
    }
}