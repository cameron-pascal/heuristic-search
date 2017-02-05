import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode} from '@angular/core';
import { MainModule } from './modules/main.module';

//enableProdMode();
platformBrowserDynamic().bootstrapModule(MainModule);
