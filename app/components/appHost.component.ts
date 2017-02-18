import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-host',
    template: `
        <router-outlet></router-outlet>
    `
})
export class AppHostComponent implements OnInit {
    constructor() { }

    ngOnInit() { }
}