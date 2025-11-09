import { Component, AfterViewInit, HostListener, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { iAdmin } from '../../interfaces/Admin';

declare var bootstrap: any;

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true
})
export class Header implements AfterViewInit {
  currentAdmin: iAdmin | null = null;

  constructor(
    private renderer: Renderer2,
    private authService: AuthService,
    private router: Router
  ) {
    // Subscribe to current admin
    this.authService.currentAdmin$.subscribe(admin => {
      this.currentAdmin = admin;
    });
  }

  logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }


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