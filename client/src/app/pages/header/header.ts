import { Component, AfterViewInit, HostListener, Renderer2, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { iUser } from '../../interfaces/User';
import { LogIn } from '../log-in/log-in';
import { SignIn } from '../sign-in/sign-in';
import { ForgetPassword } from '../forget-password/forget-password';
import { AuthService } from '../../services/auth';
import { Subscription } from 'rxjs';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule, FormsModule, LogIn, SignIn, ForgetPassword],
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true
})
export class Header implements AfterViewInit, OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  currentUser: iUser | null = null;
  showUserMenu: boolean = false;
  
  // Chat properties
  isChatOpen: boolean = false;
  hasNewMessage: boolean = true;
  newMessage: string = '';
  chatMessages: any[] = [];
  
  @ViewChild('chatMessagesDiv') chatMessagesElement!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private renderer: Renderer2,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe vào AuthService để lắng nghe thay đổi trạng thái
    this.subscriptions.push(
      this.authService.isLoggedIn$.subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
      })
    );
    
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );

    // Initialize chat with welcome message
    this.initializeChat();
  }

  private initializeChat(): void {
    this.chatMessages = [
      {
        sender: 'bot',
        text: 'Xin chào! Tôi là trợ lý ảo của TRUSTCAR. Có điều gì tôi có thể giúp bạn hôm nay không? 😊',
        time: this.getCurrentTime()
      }
    ];
  }

  ngOnDestroy(): void {
    // Unsubscribe để tránh memory leak
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewInit(): void {
    // Ensure body padding equals navbar height to avoid overlap
    this.adjustBodyPadding();
    // small defensive re-run to handle fonts/loading
    setTimeout(() => this.adjustBodyPadding(), 50);
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.adjustBodyPadding();
  }

  private adjustBodyPadding() {
    try {
      const navbar = document.querySelector('.navbar') as HTMLElement | null;
      if (navbar) {
        const h = navbar.offsetHeight;
        document.body.style.paddingTop = h + 'px';
      }
    } catch (e) {
      // ignore
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  onLoginSuccess(user: iUser) {
    // Sử dụng AuthService thay vì cập nhật trực tiếp
    this.authService.login(user);
  }

  logout() {
    // Sử dụng AuthService thay vì xử lý trực tiếp
    this.authService.logout();
    this.showUserMenu = false;
  }

  // Chat methods
  toggleChatBox(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      this.hasNewMessage = false;
      setTimeout(() => {
        this.scrollToBottom();
        if (this.messageInput) {
          this.messageInput.nativeElement.focus();
        }
      }, 300);
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    // Add user message
    this.chatMessages.push({
      sender: 'user',
      text: this.newMessage,
      time: this.getCurrentTime()
    });

    const userMessage = this.newMessage;
    this.newMessage = '';
    
    // Trigger change detection immediately
    this.cdr.detectChanges();
    
    setTimeout(() => this.scrollToBottom(), 100);

    // Simulate bot response
    setTimeout(() => {
      this.addBotResponse(userMessage);
    }, 1000);
  }

  private addBotResponse(userMessage: string): void {
    let response = '';
    
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('thuê xe') || lowerMessage.includes('đặt xe')) {
      response = 'Bạn có thể tìm và đặt xe trên trang chủ của chúng tôi. Hãy chọn địa điểm và thời gian thuê xe nhé! 🚗';
    } else if (lowerMessage.includes('giá') || lowerMessage.includes('phí')) {
      response = 'Giá thuê xe tùy thuộc vào loại xe và thời gian thuê. Bạn có thể xem giá chi tiết trên từng xe! 💰';
    } else if (lowerMessage.includes('chủ xe') || lowerMessage.includes('đăng xe')) {
      response = 'Để trở thành chủ xe, bạn có thể đăng ký tại mục "Trở thành chủ xe" trên header. Chúng tôi sẽ hướng dẫn bạn từng bước! 🤝';
    } else if (lowerMessage.includes('liên hệ') || lowerMessage.includes('hỗ trợ')) {
      response = 'Bạn có thể liên hệ với chúng tôi qua trang "Liên hệ" hoặc hotline 1900-xxxx. Chúng tôi luôn sẵn sàng hỗ trợ! 📞';
    } else if (lowerMessage.includes('cảm ơn') || lowerMessage.includes('thanks')) {
      response = 'Rất vui được giúp đỡ bạn! Chúc bạn có những chuyến đi an toàn và thú vị cùng TRUSTCAR! 🌟';
    } else {
      response = 'Cảm ơn bạn đã liên hệ! Tôi có thể giúp bạn tìm hiểu về dịch vụ thuê xe, trở thành chủ xe, hoặc các thông tin khác. Bạn cần hỗ trợ gì cụ thể không? 🤔';
    }

    this.chatMessages.push({
      sender: 'bot',
      text: response,
      time: this.getCurrentTime()
    });

    // Trigger change detection immediately for bot response
    this.cdr.detectChanges();

    setTimeout(() => this.scrollToBottom(), 100);
  }

  private scrollToBottom(): void {
    if (this.chatMessagesElement) {
      const element = this.chatMessagesElement.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private getCurrentTime(): string {
    return new Date().toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // TrackBy function for ngFor performance
  trackByMessage(index: number, message: ChatMessage): string {
    return `${message.sender}-${message.time}-${index}`;
  }
}


