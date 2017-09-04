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
            { route: ['', 'login'], name: 'login', moduleId: 'auth/login', nav: true, title: 'Login' },
            { route: 'find', name: 'Find', moduleId: './listings', nav: true, title: 'Find', auth: true },
            { route: 'listings', name: 'Projects', moduleId: './listings', nav: true, title: 'Projects', auth: true },
            { route: 'listing-detail/:id', name: 'project', moduleId: './listing-detail', nav: true, title: 'Project Detail', auth: true, href: "#listing-detail" },
            { route: 'login', name: 'login', moduleId: 'auth/login', nav: false, title: 'Login' }
        ]);

        this.router = router;

        for (let route of this.routeList) {
            this.router.addRoute(route);
        }

        this.router.refreshNavigation();
    }

    activate() {
        this.routeList = [{
                "route": "users",
                "name": "users",
                "moduleId": "users",
                "nav": true,
                "title": "Github Users",
                "href": "#users",
                "auth": true
            },
            {
                "route": "child-router",
                "name": "child-router",
                "moduleId": "child-router",
                "nav": true,
                "title": "Child Router",
                "href": "#child-router",
                "auth": true
            }
        ];
    }

    attached() {
        this.appState.refreshConnection();
    }

    detached() {
        this.ready = false;
    }

    logout() {
        let logoutRedirect = '/#login';
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
            debugger;
            if (!this.applicationState.isAuthenticated)
                window.location.href = "#/login"; //window.location.href = baseUrl() + "#/login";
        }

        return next();
    }
}