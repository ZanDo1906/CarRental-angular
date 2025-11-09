import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OwnerService } from '../../services/owner.service';

@Component({
  selector: 'app-side-bar',
  imports: [RouterModule, CommonModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar {
  ownerId: number | null = null;
  isDropdownOpen = false;

  constructor(private ownerService: OwnerService) {
    // initialize from service/localStorage and react to changes
    this.ownerId = this.ownerService.getOwnerId();
    this.ownerService.ownerId$.subscribe(id => this.ownerId = id);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}
