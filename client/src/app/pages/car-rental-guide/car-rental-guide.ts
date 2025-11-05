import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-car-rental-guide',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './car-rental-guide.html',
  styleUrl: './car-rental-guide.css',
})
export class CarRentalGuide {

  constructor(private router: Router) {}

  goToAboutTrustcar() {
    this.router.navigate(['/ve-trust-car']);
  }
}
