import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit, OnDestroy {
  protected readonly title = 'Auto Stock Manager';
  protected readonly currentYear = new Date().getFullYear();
  protected isMobile: boolean = false;
  protected sideNavOpen: boolean = false;
  protected isAdmin = false;

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.checkScreenSize();
    this.checkAdminStatus();
  }

  private checkAdminStatus(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === 0;
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 800;
    if (!this.isMobile) {
      this.sideNavOpen = false;
    }
  }

  toggleSideNav() {
    this.sideNavOpen = !this.sideNavOpen;
  }

  closeSideNav() {
    this.sideNavOpen = false;
  }
}
