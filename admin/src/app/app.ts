import { Component, signal } from '@angular/core';
import { AccountManagement } from './pages/account-management/account-management';
import { CarRegistrationApproval } from './pages/car-registration-approval/car-registration-approval';
import { Header } from './pages/header/header';
import { Footer } from './pages/footer/footer';
import { RouterModule } from '@angular/router';
import { SideBar } from './pages/side-bar/side-bar';
import { Dashboard } from './pages/dashboard/dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AccountManagement, Header, Footer, RouterModule, CarRegistrationApproval, SideBar, Dashboard],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }
