import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about-trustcar',
  standalone: true,
  imports: [],
  templateUrl: './about-trustcar.html',
  styleUrl: './about-trustcar.css',
})
export class AboutTrustCar implements AfterViewInit {
  constructor(private el: ElementRef, private router: Router) {}

  ngAfterViewInit(): void {
    this.setupSlideAnimation();
    this.setupFadeInAnimation();
    this.setupThirthAnimation();
    this.setupFourthAnimation();
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
  //Thirth
  private setupThirthAnimation(): void {
    const container = this.el.nativeElement.querySelector('.thirth');
    const img = this.el.nativeElement.querySelector('.thirth-img');
    const content = this.el.nativeElement.querySelector('.thirth-content');

    if (!container || !img || !content) { return; }

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
    }, { threshold: 0.2 });

    observer.observe(container);
  }

  //Fouth
  private setupFourthAnimation(): void {
    const container = this.el.nativeElement.querySelector('.fourth');
    const content = this.el.nativeElement.querySelector('.fourth-content');
    const img = this.el.nativeElement.querySelector('.fourth-img');

    if (!container || !img || !content) { return; }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          content.classList.add('animate-left');
          img.classList.add('animate-right');
        } else {
          content.classList.remove('animate-left');
          img.classList.remove('animate-right');
        }
      });
    }, { threshold: 0.2 });

    observer.observe(container);
  }

  goToOwnerPage() {
    this.router.navigate(['/owner']);
  }
  goToCarList() {
    this.router.navigate(['/danh-sach-xe']);
  }

}
