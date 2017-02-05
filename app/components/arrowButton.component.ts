import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: 'arrow-button',
    templateUrl: './app/templates/arrowButton.component.html',
    styles: [`
        div { width: 100%; height: 100% } 
        div :hover { fill: #808080 }
    `]
})

export class ArrowButtonComponent {

    @Input() orientationAngle: number = 0;

    @Output() onClicked: EventEmitter<any> = new EventEmitter();

    notifyClicked() {
        this.onClicked.emit();
    }
}