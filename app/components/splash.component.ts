import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SearchManagerService } from '../services/searchManager.service';

@Component({
    selector: 'splash',
    templateUrl: './app/templates/splash.component.html'
})
export class SplashComponent {
    constructor(private readonly router: Router, private readonly searchManager: SearchManagerService) { }

    generateGrids() {
        this.searchManager.initializeWithGeneratedGrids();
        this.router.navigate(['/result']);
    }

    importGrid(files: FileList) {
        const reader = new FileReader();
        const self = this;
        reader.onload = function() {
            self.searchManager.initializeWithSerializedGrid(reader.result);
            self.router.navigate(['/result']);
        };

        if (files.length > 0) {
            reader.readAsText(files[0]);
        }
    }
}