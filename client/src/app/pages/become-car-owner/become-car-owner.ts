import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-become-car-owner',
  standalone: true,
  imports: [],
  templateUrl: './become-car-owner.html',
  styleUrl: './become-car-owner.css',
})
export class BecomeCarOwner {
  constructor(private el: ElementRef, private router: Router) {}

  goToRegisterOwner(){
    this.router.navigate(['/dk-cho-thue-xe']);
  }
}
