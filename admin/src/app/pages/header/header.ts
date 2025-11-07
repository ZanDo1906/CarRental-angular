import { Component, AfterViewInit, HostListener, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true
})
export class Header implements AfterViewInit { 


  constructor(private renderer: Renderer2) {}


  ngAfterViewInit(): void {
    this.adjustBodyPadding();
    setTimeout(() => this.adjustBodyPadding(), 50);
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.adjustBodyPadding();
  }

  private adjustBodyPadding() {
    try {
      const navbar = document.querySelector('.navbar') as HTMLElement | null;
      if (navbar) {
        const h = navbar.offsetHeight;
        document.body.style.paddingTop = h + 'px';
      }
    } catch (e) {

    }
  }


}