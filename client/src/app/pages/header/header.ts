import { Component, AfterViewInit, HostListener, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { iUser } from '../../interfaces/User';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true
})
export class Header implements AfterViewInit {
  isLoggedIn: boolean = false;  // default: not logged in
  currentUser: iUser | null = null;
  showUserMenu: boolean = false;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    // Ensure body padding equals navbar height to avoid overlap
    this.adjustBodyPadding();
    // small defensive re-run to handle fonts/loading
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
      // ignore
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }
}


