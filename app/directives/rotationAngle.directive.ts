import { Directive, ElementRef, Input, Renderer } from '@angular/core';

@Directive({ selector: '[rotationAngle]'})
export class RotationDirective {
    
    @Input() rotationAngle: number;

    private element: ElementRef;

    private renderer: Renderer;

    constructor(el: ElementRef, renderer: Renderer) {
        this.element = el;
        this.renderer = renderer;
    }

    ngOnInit() {
        this.rotate(this.element.nativeElement, this.rotationAngle, this.renderer);
    }

    private rotate(el: HTMLElement, angle: number, renderer: Renderer) {
        let rotation = 'rotate(' + angle + 'deg)';

        renderer.setElementStyle(el, 'transform', rotation);
    }
}