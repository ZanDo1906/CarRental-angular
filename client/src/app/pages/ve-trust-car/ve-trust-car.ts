import { Component,AfterViewInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-ve-trust-car',
  imports: [],
  templateUrl: './ve-trust-car.html',
  styleUrl: './ve-trust-car.css',
})
export class VeTrustCar implements AfterViewInit { 


  constructor(private el: ElementRef) {}

 
  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

 
  private setupIntersectionObserver(): void {
   
    const img = this.el.nativeElement.querySelector('.first img');
    const content = this.el.nativeElement.querySelector('.first-content');
    const container = this.el.nativeElement.querySelector('.first');

    if (!img || !content || !container) {
      console.error('Không tìm thấy phần tử .first, img, hoặc .first-content');
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          
          img.classList.add('animate-left');
          content.classList.add('animate-right');
        } else {
         
          img.classList.remove('animate-left');
          content.classList.remove('animate-right');
        }
      });
    }, {
      threshold: 0.2 
    });

    observer.observe(container);
  }
}
