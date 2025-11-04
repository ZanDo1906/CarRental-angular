import { Component, signal } from '@angular/core';
import { TestData } from "./pages/test-data/test-data";
import { JsonPipe } from '@angular/common';
import { AccountManagement } from './pages/account-management/account-management';
import { CarRegistrationApproval } from './pages/car-registration-approval/car-registration-approval';
import { Header } from './pages/header/header';
import { Footer } from './pages/footer/footer';
import { RouterModule } from '@angular/router';
import { SideBar } from './pages/side-bar/side-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TestData, JsonPipe, AccountManagement, Header, Footer, RouterModule, CarRegistrationApproval, SideBar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }
