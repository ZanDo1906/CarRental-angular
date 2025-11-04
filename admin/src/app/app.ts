import { Component, signal } from '@angular/core';
import { Dashboard } from "./pages/dashboard/dashboard";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Dashboard],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }
