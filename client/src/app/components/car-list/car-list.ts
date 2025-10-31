import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-car-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './car-list.html',
  styleUrl: './car-list.css'
})
export class CarListComponent implements OnInit {
  cars: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get<any[]>('/data/cars.json').subscribe({
      next: (data) => {
        this.cars = data;
        console.log('Dữ liệu xe:', this.cars);
      },
      error: (err) => console.error('Lỗi khi load JSON', err)
    });
  }
}
