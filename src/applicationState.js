import { inject, bindable, computedFrom } from 'aurelia-framework';
import { SignalR } from 'signalr';
import { EventAggregator } from 'aurelia-event-aggregator';
import { AuthService } from 'aurelia-authentication';

@inject(EventAggregator, AuthService)
export class applicationState {
    constructor(eventAggregator, authService) {
        this.eventAggregator = eventAggregator;
        this.loggedInUser = '';
        this.loggedInUserType = '';
        this.authService = authService;
        var self = this;

        // SignalR Connectivity

        //this.signalRurl = 'http://www.realtoranalytics.com';
        this.signalRurl = '';


        console.log(this.signalRurl);
        this.connectionStatus = "Disconnected";

        this.connection = $.hubConnection(this.signalRurl);
        this.listingsHub = this.connection.createHubProxy('listingsHub');
        this.adminHub = this.connection.createHubProxy('adminHub');

        console.log('Connecting...');

        this.adminHub.on('broadcastMessage', function(subject, data) {
            console.log("**** Server Message **** " + subject);
            var payload = {};
            self.eventAggregator.publish(subject, payload);
        });


        this.connection.disconnected(function() {
            console.log('Disconnected');
            self.connectionStatus = "Disconnected";
            self.ChangeConnectionStatus("Disconnected");
            this.hubConnected = false;
        });

        this.connection.reconnecting(function() {
            console.log('Reconnecting');
            self.connectionStatus = "Connecting";
            self.ChangeConnectionStatus("Connecting");
            this.hubConnected = false;
        });

        this.connection.reconnected(function() {
            console.log('Reconnected');
            self.connectionStatus = "Connected";
            self.ChangeConnectionStatus("Connected");
            this.hubConnected = true;
        });

        // System Messages Liner
        this.configuration = {
            optionOne: false,
            optionTwo: false
        };
    }

    detached() {
        console.log("Stopping SignalR Connection");
        this.connection.stop();
    }

    refreshConnection() {
        var self = this;
        debugger;
        this.connection.qs = {
            "access_token": this.authService.getAccessToken(),
            "session_token": localStorage.getItem("session_token")
        }
        this.connectionReady = this.connection.start().done(function() {
            console.log('Connected');
            self.connectionStatus = "Connected";
            self.ChangeConnectionStatus("Connected");
        }).fail(function() {
            console.log('Could not Connect');
            self.connectionStatus = "Disconnected";
            self.ChangeConnectionStatus("Disconnected");
        });
    }

    ChangeConnectionStatus(connectionStatus) {
        if (connectionStatus == "Disconnected") {
            $(".connectionStatus").css("background-color", 'Red');
        }
        if (connectionStatus == "Connected") {
            $(".connectionStatus").css("background-color", 'Green');
        }
        if (connectionStatus == "Connecting") {
            $(".connectionStatus").css("background-color", 'Orange');
        }
    }


}