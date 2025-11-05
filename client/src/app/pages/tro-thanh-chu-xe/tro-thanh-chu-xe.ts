import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-tro-thanh-chu-xe',
  imports: [],
  templateUrl: './tro-thanh-chu-xe.html',
  styleUrl: './tro-thanh-chu-xe.css',
})
export class TroThanhChuXe {
  constructor(private el: ElementRef, private router: Router) {}

  goToRegisterOwner(){
    this.router.navigate(['/dk-cho-thue-xe']);
  }
}
