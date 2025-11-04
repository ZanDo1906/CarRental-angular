import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  year = new Date().getFullYear();
  socials = [
    { icon: 'bi-instagram', label: 'Instagram', href: '#' },
    { icon: 'bi-chat-dots', label: 'Zalo', href: '#' },
    { icon: 'bi-facebook', label: 'Facebook', href: '#' },
    { icon: 'bi-linkedin', label: 'LinkedIn', href: '#' },
  ];

}
