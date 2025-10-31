import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CarListComponent } from './components/car-list/car-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, CarListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }
