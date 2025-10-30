import { Component, signal } from '@angular/core';
import { HomePage } from './home-page/home-page';

@Component({
  selector: 'app-root',
  imports: [HomePage],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('car-rental-angular');
}
