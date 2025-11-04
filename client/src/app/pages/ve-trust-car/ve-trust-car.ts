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
    this.setupSlideAnimation();
    
    this.setupFadeInAnimation();
  }

  // Hàm  xử lý animation .first
  private setupSlideAnimation(): void {
    const img = this.el.nativeElement.querySelector('.first img');
    const content = this.el.nativeElement.querySelector('.first-content');
    const container = this.el.nativeElement.querySelector('.first');

    if (!img || !content || !container) {
      console.error('Không tìm thấy phần tử .first, img, hoặc .first-content');
      return;
    }

    const slideObserver = new IntersectionObserver((entries) => {
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

    slideObserver.observe(container);
  }

  // Hàm xử lý animation .second
  private setupFadeInAnimation(): void {
    const secondContainer = this.el.nativeElement.querySelector('.second');

    if (!secondContainer) {
      console.error('Không tìm thấy phần tử .second');
      return;
    }

    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          secondContainer.classList.add('animate-fade-in');
        } else {
          secondContainer.classList.remove('animate-fade-in');
        }
      });
    }, {
      threshold: 0.2 
    });

    fadeObserver.observe(secondContainer);
  }
}
