import { Component, AfterViewInit, ViewChild, ViewChildren, ElementRef, Renderer, Input } from '@angular/core';

@Component({
    selector: 'range-input-box',
    templateUrl: './app/templates/rangeInputBox.component.html',
    styles: [`
        input { 
            float: left;
            text-align: right;
            font-size: 22px;
            font-family: Arial;
            border: none;
        }

        input:focus { 
            outline: none;
        }

        span {
            float: right;
            font-size: 22px;
            color: #AFAFAF;
            font-family: Arial;
        }

        div { 
            display: inline-flex;
            flex-basis: content;
            align-items: center;
            border: 1px solid #d7d6d6; 
            background: #fff; 
            padding: 10px 10px 10px 20px;
        }
    `]
})

export class RangeInputBoxComponent implements AfterViewInit {

    private renderer: Renderer;

    currentIndex: number;

    @ViewChild('container') container: ElementRef;

    @Input() minSize: number;
    @Input() maxLength: number;
    @Input() rangeMax: number;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
    }

    clicked(event: any) {
        this.renderer.setElementStyle(this.container.nativeElement, 'box-shadow', '0 0 3px #00CCFF');
        this.container.nativeElement.querySelector('input').focus();
    }

    lostFocus(event: any) {
        this.renderer.setElementStyle(this.container.nativeElement, 'box-shadow', 'none');
    }

    onInputChange(value: string) {
        let numericValue = Number(value);

        if (numericValue !== NaN && numericValue <= this.rangeMax) {
            this.currentIndex = numericValue;
            console.log('set to ' + numericValue);
        }
    }

    ngAfterViewInit() {
    }

}