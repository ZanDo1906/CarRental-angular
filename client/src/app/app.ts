import { Component, signal } from '@angular/core';
import { CarListComponent } from './car-list/car-list';

@Component({
  selector: 'app-root',
  imports: [CarListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('client');
}
