import { Component, AfterViewInit, HostListener, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { iUser } from '../../interfaces/User';
import { LogIn } from '../log-in/log-in';
import { SignIn } from '../sign-in/sign-in';
import { AuthService } from '../../services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule, LogIn, SignIn],
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true
})
export class Header implements AfterViewInit, OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  currentUser: iUser | null = null;
  showUserMenu: boolean = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private renderer: Renderer2,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe vào AuthService để lắng nghe thay đổi trạng thái
    this.subscriptions.push(
      this.authService.isLoggedIn$.subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
      })
    );
    
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe để tránh memory leak
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
    // Sử dụng AuthService thay vì cập nhật trực tiếp
    this.authService.login(user);
  }

  logout() {
    // Sử dụng AuthService thay vì xử lý trực tiếp
    this.authService.logout();
    this.showUserMenu = false;
  }
}


