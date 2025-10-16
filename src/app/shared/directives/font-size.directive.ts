import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appFontSize]',
  standalone: true
})
export class FontSizeDirective implements OnInit {
  @Input('appFontSize') fontSize: number | string = 16;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.applyFontSize();
  }

  private applyFontSize(): void {
    const size = this.normalizeFontSize(this.fontSize);
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'font-size',
      size
    );
  }

  private normalizeFontSize(size: number | string): string {
    if (typeof size === 'number') {
      return `${size}px`;
    }

    if (typeof size === 'string' && size.trim() !== '') {
      if (!isNaN(Number(size))) {
        return `${size}px`;
      }  
      return size;
    }
    
    return '16px';
  }
}
