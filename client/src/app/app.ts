import { Component, signal } from '@angular/core';
import { TestData } from "./pages/test-data/test-data";
import { JsonPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router'
import { Header } from './pages/header/header';
import { Footer } from './pages/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }
