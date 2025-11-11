import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBar } from '../side-bar/side-bar';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, SideBar],
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.css']
})
export class UserLayoutComponent {
  constructor() {}
}
