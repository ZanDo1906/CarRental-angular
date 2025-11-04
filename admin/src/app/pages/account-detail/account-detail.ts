import { Component } from '@angular/core';
import usersData from '../../../assets/data/User.json';

@Component({
  selector: 'app-account-detail',
  imports: [],
  templateUrl: './account-detail.html',
  styleUrl: './account-detail.css',
})
export class AccountDetail {

  users = usersData;
    
}
