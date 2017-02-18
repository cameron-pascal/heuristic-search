import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'splash',
    templateUrl: './app/templates/splash.component.html'
})
export class SplashComponent {
    constructor(private readonly router: Router) { }

    generateGrids() {
        this.router.navigate(['/result']);
    }

    importGrid(files: FileList) {
        const reader = new FileReader();

        reader.onload = function() {
            console.log(reader.result);
        };

        if (files.length > 0) {
            reader.readAsText(files[0]);
        }
    }
}