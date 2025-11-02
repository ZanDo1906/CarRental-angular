import { Component, signal } from '@angular/core';
import { TestData } from "./pages/test-data/test-data";
import { JsonPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router'
import { Header } from './pages/header/header';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TestData, JsonPipe,RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }
