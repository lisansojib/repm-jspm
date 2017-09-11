import { AuthService } from 'aurelia-authentication';
import { inject, computedFrom } from 'aurelia-framework';
import { ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { BootstrapFormRenderer } from 'resources/renderer/bootstrap-form-renderer';
import { AppService } from 'appService';
import { App } from 'app';

@inject(ValidationControllerFactory, AuthService, App, AppService)
export class Login {
    username = '';
    password = '';
    controller = null;
    rememberMe = false;

    constructor(controllerFactory, authService, app, appService) {
        this.authService = authService;
        this.app = app;
        this.appService = appService;
        this.controller = controllerFactory.createForCurrentScope();
        this.controller.addRenderer(new BootstrapFormRenderer());
    }

    activate() {
        if (this.isAuthenticated) {
            window.location.href = "#listings";
        }
    }

    submit() {
        return this.controller.validate()
            .then(result => {
                if (result.valid) {
                    toastr.info("You are now sign in to Puget builder");
                    this.authService.login({
                            username: this.email,
                            password: this.password,
                            grant_type: "password"
                        }, {
                            //mode: 'cors',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        })
                        .then(response => {
                            toastr.success('Login successful');
                            localStorage.setItem('route_mapped', false);
                            localStorage.setItem('session_token', response.session_token);
                        })
                        .catch(err => {
                            toastr.error("Invalid email or password.");
                        });
                }
            })
    };

    canActivated() {
        if (this.auth.authenticated()) {
            window.location.href = "/";
        }
    }

    // updateRoutes(session_token) {
    //     let url = `routes?token=${session_token}`;
    //     this.appService.httpClient
    //         .fetch(url, {
    //             method: 'get'
    //         })
    //         .then(response => response.json())
    //         .then(routes => {
    //             let routeList = JSON.parse(routes);

    //             for (let route of routeList) {
    //                 debugger;
    //                 if (this.app.router.hasOwnRoute(route.name)) {
    //                     var existingRout = this.app.router.find(x => x.name == route.name);
    //                     debugger;
    //                     existingRout.roles = route.roles;
    //                     existingRout.nav = route.nav;
    //                     continue;
    //                 }

    //                 this.app.router.addRoute(route);
    //             }

    //             debugger;
    //             this.app.router.refreshNavigation();
    //         })
    //         .catch(error => {
    //             console.log(error);
    //         });
    // }

    authenticate(name) {
        return this.authService.authenticate(name)
            .then(response => {
                console.log("auth response " + response);
            })
            .catch(err => {
                console.log(err);
            });
    }

    // use computedFrom to avoid dirty checking
    @computedFrom('authService.authenticated')
    get isAuthenticated() {
        return this.authService.authenticated;
    }

    setRemember() {
        if (this.rememberMe)
            localStorage.setItem("aurelia-remember", 'yes');
        else
            localStorage.removeItem("aurelia-remember");
    }
}


ValidationRules
    .ensure(a => a.email).required().email()
    .ensure(a => a.password).required()
    .on(Login);