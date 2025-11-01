import { Component } from '@angular/core';
import { TestData } from "./pages/test-data/test-data";
import { JsonPipe } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TestData, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }
