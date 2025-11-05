import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SideBar } from '../side-bar/side-bar';


@Component({
  selector: 'app-user-account',
  imports: [CommonModule, RouterModule, SideBar],
  templateUrl: './user-account.html',
  styleUrl: './user-account.css',
})
export class UserAccount {

}
