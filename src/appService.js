import { inject } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import { AuthService } from 'aurelia-authentication';
import { Router } from 'aurelia-router';

@inject(HttpClient, AuthService, Router)
export class AppService {
    appRouter;

    constructor(httpClient, authService, router) {
        this.authService = authService;
        this.httpClient = httpClient;
        this.appRouter = router;
        var self = this;

        this.httpClient.configure(config => {
            config
                .useStandardConfiguration()
                .withBaseUrl('http://localhost:52377/api/')
                .withDefaults({
                    credentials: 'same-origin',
                    headers: {
                        'X-Requested-With': 'Fetch'
                    }
                })
                .withInterceptor({
                    request(request) {
                        request.headers.append('Authorization', `Bearer ${self.authService.getAccessToken()}`);
                        return request;
                    }
                });
        });
    }
}