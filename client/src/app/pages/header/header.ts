import { Component, AfterViewInit, HostListener, Renderer2, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { iUser } from '../../interfaces/User';
import { LogIn } from '../log-in/log-in';
import { SignIn } from '../sign-in/sign-in';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule, LogIn, SignIn],
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true
})
export class Header implements AfterViewInit, OnInit {
  isLoggedIn: boolean = false;
  currentUser: iUser | null = null;
  showUserMenu: boolean = false;

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    // Kiểm tra localStorage khi khởi động
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      this.isLoggedIn = true;
    }
  }

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

  onLoginSuccess(user: iUser) {
    this.currentUser = user;
    this.isLoggedIn = true;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    this.isLoggedIn = false;
    this.showUserMenu = false;
  }
}


