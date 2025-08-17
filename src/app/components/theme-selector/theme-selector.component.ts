import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../services/theme.service';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-selector.component.html',
  styleUrl: './theme-selector.component.css'
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
    
    if (this.isOpen) {
      // Position the dropdown relative to the button
      setTimeout(() => {
        const button = document.querySelector('.theme-button') as HTMLElement;
        const dropdown = document.querySelector('.theme-dropdown') as HTMLElement;
        if (button && dropdown) {
          const rect = button.getBoundingClientRect();
          dropdown.style.top = `${rect.bottom + 8}px`;
          dropdown.style.right = `${window.innerWidth - rect.right}px`;
        }
      });
    }
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
