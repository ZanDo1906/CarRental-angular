import { Component, AfterViewInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-homepage',
  imports: [],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements AfterViewInit { 


  //First
  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.startCounter(); 
  }

  private startCounter(): void {
    const countElement = this.el.nativeElement.querySelector('#customer-count');

    if (!countElement) {
      console.error('Không tìm thấy #customer-count');
      return;
    }

    const start = 5000;
    const end = 10000;
    const duration = 2000; 
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const currentValue = Math.floor(start + (end - start) * percentage);

      countElement.innerText = currentValue.toLocaleString('vi-VN'); 

      if (progress < duration) {
        requestAnimationFrame(step);
      } else {
        countElement.innerText = end.toLocaleString('vi-VN');
      }
    };

    requestAnimationFrame(step);
  }
}
