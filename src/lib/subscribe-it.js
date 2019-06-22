import {SubscribeItExecutor} from "./subscribe-it-executor";

export class SubscribeIt {
    constructor() {
        this.loadJquery();
    }

    loadJquery() {
        if (window.jQuery === undefined) {
            const script_tag = document.createElement('script');
            script_tag.setAttribute("type", "text/javascript");
            script_tag.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js");
            if (script_tag.readyState) {
                script_tag.onreadystatechange = function () { // For old versions of IE
                    if (this.readyState == 'complete' || this.readyState == 'loaded') {
                        scriptLoadHandler();
                    }
                };
            } else {
                script_tag.onload = this.scriptLoadHandler;
            }
            // Try to find the head, otherwise default to the documentElement
            (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
        } else {
            // The jQuery version on the window is the one we want to use
            this.$ = window.jQuery;
            const subscribeItExecutor = new SubscribeItExecutor(this.$);
            subscribeItExecutor.execute();
        }
    }

    scriptLoadHandler() {
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        this.$ = window.jQuery.noConflict(true);
        // Call our main function
        const subscribeItExecutor = new SubscribeItExecutor(this.$);
        subscribeItExecutor.execute();
    }

    /*main() {
        this.$(document).ready(function ($) {
            console.log('I am here');
        });
    }*/
}