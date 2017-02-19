import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent }  from '../components/main.component';
import { AppHostComponent} from '../components/appHost.component';
import { SplashComponent} from '../components/splash.component';
import { ArrowButtonComponent } from '../components/arrowButton.component';
import { IndexSelectorComponent } from '../components/indexSelector.component';
import { RangeInputBoxComponent } from '../components/rangeInputBox.component';
import { GridComponent } from '../components/grid.component';
import { CellInfoComponent } from '../components/cellInfo.component';
import { SearchSelectorComponent } from '../components/searchSelector.component';
import { RotationDirective } from '../directives/rotationAngle.directive';
import { SearchManagerService } from '../services/searchManager.service';

const routes: Routes = [ 
  { path: 'splash', component: SplashComponent },
  { path: 'result', component: MainComponent },
  { path: '', redirectTo: '/splash', pathMatch: 'full'}
];

@NgModule({
  providers: [SearchManagerService],
  imports: [ BrowserModule, FormsModule, RouterModule.forRoot(routes) ],
  exports: [ MainComponent ],
  declarations: [ MainComponent, AppHostComponent, SplashComponent, ArrowButtonComponent, IndexSelectorComponent, SearchSelectorComponent, CellInfoComponent, RangeInputBoxComponent, RotationDirective, GridComponent ],
  bootstrap: [AppHostComponent]
})

export class MainModule { }
