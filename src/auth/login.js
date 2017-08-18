import { AuthService } from 'aurelia-authentication';
import { inject, computedFrom } from 'aurelia-framework';
import { ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { BootstrapFormRenderer } from 'resources/renderer/bootstrap-form-renderer';

@inject(ValidationControllerFactory, AuthService)
export class Login {
    username = '';
    password = '';
    controller = null;
    rememberMe = false;

    constructor(controllerFactory, authService) {
        debugger;
        this.authService = authService;
        this.controller = controllerFactory.createForCurrentScope();
        this.controller.addRenderer(new BootstrapFormRenderer());
    }

    activate() {
        if (this.isAuthenticated) {
            window.location.href = "#/";
        }
    }

    submit() {
        return this.controller.validate()
            .then(result => {
                debugger;
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
                            debugger;
                            toastr.success('Login successful');
                            localStorage.setItem('session_token', response.session_token)
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

    authenticate(name) {
        debugger;
        return this.authService.authenticate(name)
            .then(response => {
                debugger;
                console.log("auth response " + response);
            })
            .catch(err => {
                debugger;
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