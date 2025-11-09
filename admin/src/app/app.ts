import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './pages/header/header';
import { Footer } from './pages/footer/footer';
import { RouterModule } from '@angular/router';
import { SideBar } from './pages/side-bar/side-bar';
import { LogIn } from './pages/log-in/log-in';
import { AuthService } from './services/auth.service';
import { iAdmin } from './interfaces/Admin';

declare var bootstrap: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, Header, Footer, RouterModule, SideBar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  isLoggedIn = false;
  currentAdmin: iAdmin | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.currentAdmin$.subscribe(admin => {
      this.isLoggedIn = !!admin;
      this.currentAdmin = admin;
    });
  }
}
