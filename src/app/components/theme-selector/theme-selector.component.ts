import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../services/theme.service';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theme-selector" [class.open]="isOpen">
      <button 
        class="theme-button"
        (click)="toggleDropdown()"
        [attr.aria-expanded]="isOpen"
        aria-label="Select theme"
      >
        <span class="theme-icon">🎨</span>
        <span class="theme-name">{{ currentTheme.displayName }}</span>
        <span class="dropdown-arrow" [class.rotated]="isOpen">▼</span>
      </button>
      
      <div class="theme-dropdown" [class.visible]="isOpen">
        <div class="theme-options">
          <button
            *ngFor="let theme of themes"
            class="theme-option"
            [class.active]="theme.id === currentTheme.id"
            (click)="selectTheme(theme)"
          >
            <div class="theme-preview" [style.background]="theme.colors.buttonPrimary"></div>
            <span class="theme-display-name">{{ theme.displayName }}</span>
            <span *ngIf="theme.id === currentTheme.id" class="check-mark">✓</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .theme-selector {
      position: relative;
      display: inline-block;
    }

    .theme-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--color-surface, rgba(255, 255, 255, 0.1));
      border: 1px solid var(--color-border, rgba(255, 255, 255, 0.2));
      border-radius: 8px;
      color: var(--color-text-primary, #ffffff);
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .theme-button:hover {
      background: var(--color-button-primary-hover, rgba(255, 255, 255, 0.2));
      transform: translateY(-1px);
    }

    .theme-icon {
      font-size: 1rem;
    }

    .theme-name {
      white-space: nowrap;
    }

    .dropdown-arrow {
      font-size: 0.75rem;
      transition: transform 0.3s ease;
    }

    .dropdown-arrow.rotated {
      transform: rotate(180deg);
    }

    .theme-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: var(--color-surface, rgba(0, 0, 0, 0.9));
      border: 1px solid var(--color-border, rgba(255, 255, 255, 0.2));
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(20px);
      min-width: 200px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      z-index: 1000;
      overflow: hidden;
    }

    .theme-dropdown.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .theme-options {
      padding: 0.5rem;
    }

    .theme-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: var(--color-text-primary, #ffffff);
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
    }

    .theme-option:hover {
      background: var(--color-border-light, rgba(255, 255, 255, 0.1));
    }

    .theme-option.active {
      background: var(--color-button-primary, rgba(59, 130, 246, 0.2));
    }

    .theme-preview {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      border: 2px solid var(--color-border, rgba(255, 255, 255, 0.3));
      flex-shrink: 0;
    }

    .theme-display-name {
      flex: 1;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .check-mark {
      color: var(--color-success, #10b981);
      font-weight: bold;
      font-size: 0.875rem;
    }

    /* Close dropdown when clicking outside */
    .theme-selector.open::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 999;
    }

    /* Animation for theme changes */
    :host {
      transition: all 0.3s ease;
    }

    @media (max-width: 768px) {
      .theme-dropdown {
        right: auto;
        left: 0;
        min-width: 180px;
      }
      
      .theme-button {
        padding: 0.4rem 0.8rem;
        font-size: 0.8rem;
      }
      
      .theme-name {
        display: none;
      }
    }
  `]
})
export class ThemeSelectorComponent implements OnInit {
  themes: Theme[] = [];
  currentTheme: Theme;
  isOpen = false;

  constructor(private themeService: ThemeService) {
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  ngOnInit(): void {
    this.themes = this.themeService.getThemes();
    
    // Subscribe to theme changes
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.isOpen) return;
    
    const target = event.target as HTMLElement;
    const themeSelector = target.closest('.theme-selector');
    
    if (!themeSelector) {
      this.isOpen = false;
    }
  }
}
