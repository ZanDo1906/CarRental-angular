import { Component } from '@angular/core';
import usersData from '../../../assets/data/User.json';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { SideBar } from '../side-bar/side-bar';

@Component({
  selector: 'app-account-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-management.html',
  styleUrl: './account-management.css',
})
export class AccountManagement {
  users = usersData;
}
