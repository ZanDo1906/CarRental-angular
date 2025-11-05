import { Component, signal } from '@angular/core';
import { TestData } from "./pages/test-data/test-data";
import { JsonPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router'
import { Header } from './pages/header/header';
import { Footer } from './pages/footer/footer';
import { TroThanhChuXe } from "./pages/tro-thanh-chu-xe/tro-thanh-chu-xe";
import { CarList } from './pages/carList/carList';
import { SideBar } from './pages/side-bar/side-bar';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TestData, JsonPipe, RouterOutlet, Header, Footer, CarList, SideBar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }
