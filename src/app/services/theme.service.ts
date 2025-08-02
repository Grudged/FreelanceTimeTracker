import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Theme {
  id: string;
  name: string;
  displayName: string;
  colors: {
    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    
    // Background colors
    background: string;
    backgroundGradient: string;
    surface: string;
    surfaceGradient: string;
    
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    
    // Interactive colors
    accent: string;
    accentHover: string;
    border: string;
    borderLight: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Button colors
    buttonPrimary: string;
    buttonPrimaryHover: string;
    buttonSecondary: string;
    buttonSecondaryHover: string;
    
    // Form colors
    inputBackground: string;
    inputBorder: string;
    inputFocus: string;
    inputPlaceholder: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject: BehaviorSubject<Theme>;
  public currentTheme$: Observable<Theme>;

  private themes: Theme[] = [
    {
      id: 'forest',
      name: 'forest',
      displayName: '🌲 Forest',
      colors: {
        primary: '#2d5b2d',
        primaryLight: '#4a7c4a',
        primaryDark: '#1a2e1a',
        secondary: '#6b4423',
        secondaryLight: '#8b5a2b',
        secondaryDark: '#4a2f17',
        
        background: 'linear-gradient(135deg, #1a2e1a 0%, #2d3b2d 50%, #3d4f3d 100%)',
        backgroundGradient: 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #3d5a3d 100%)',
        surface: 'linear-gradient(145deg, rgba(61, 79, 61, 0.9) 0%, rgba(45, 62, 45, 0.9) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(61, 79, 61, 0.9) 0%, rgba(45, 62, 45, 0.9) 100%)',
        
        textPrimary: '#f0fff0',
        textSecondary: '#e8f5e8',
        textMuted: '#a0c0a0',
        
        accent: '#8eb68e',
        accentHover: '#a6d4a6',
        border: 'rgba(74, 124, 74, 0.3)',
        borderLight: 'rgba(74, 124, 74, 0.2)',
        
        success: '#6eb26e',
        warning: '#d4ad47',
        error: '#cd5c5c',
        info: '#4a7c4a',
        
        buttonPrimary: 'linear-gradient(135deg, #2d5b2d 0%, #4a7c4a 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #367d36 0%, #5a9c5a 100%)',
        buttonSecondary: 'linear-gradient(135deg, #6b4423 0%, #8b5a2b 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #7d4e28 0%, #9d6830 100%)',
        
        inputBackground: 'rgba(45, 91, 45, 0.2)',
        inputBorder: 'rgba(74, 124, 74, 0.4)',
        inputFocus: '#4a7c4a',
        inputPlaceholder: '#a0c0a0'
      }
    },
    {
      id: 'ocean',
      name: 'ocean',
      displayName: '🌊 Ocean',
      colors: {
        primary: '#1e3a8a',
        primaryLight: '#3b82f6',
        primaryDark: '#1e40af',
        secondary: '#0891b2',
        secondaryLight: '#06b6d4',
        secondaryDark: '#0e7490',
        
        background: 'linear-gradient(135deg, #0c1445 0%, #1e3a8a 50%, #3b82f6 100%)',
        backgroundGradient: 'linear-gradient(135deg, #0c1445 0%, #1e40af 50%, #3b82f6 100%)',
        surface: 'linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 58, 138, 0.2) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 58, 138, 0.2) 100%)',
        
        textPrimary: '#f0f9ff',
        textSecondary: '#e0f2fe',
        textMuted: '#bae6fd',
        
        accent: '#38bdf8',
        accentHover: '#0ea5e9',
        border: 'rgba(59, 130, 246, 0.3)',
        borderLight: 'rgba(59, 130, 246, 0.2)',
        
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        
        buttonPrimary: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
        buttonSecondary: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)',
        
        inputBackground: 'rgba(30, 58, 138, 0.2)',
        inputBorder: 'rgba(59, 130, 246, 0.4)',
        inputFocus: '#3b82f6',
        inputPlaceholder: '#bae6fd'
      }
    },
    {
      id: 'sunset',
      name: 'sunset',
      displayName: '🌅 Sunset',
      colors: {
        primary: '#ea580c',
        primaryLight: '#f97316',
        primaryDark: '#c2410c',
        secondary: '#dc2626',
        secondaryLight: '#ef4444',
        secondaryDark: '#b91c1c',
        
        background: 'linear-gradient(135deg, #431407 0%, #ea580c 50%, #f97316 100%)',
        backgroundGradient: 'linear-gradient(135deg, #431407 0%, #c2410c 50%, #ea580c 100%)',
        surface: 'linear-gradient(145deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.2) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.2) 100%)',
        
        textPrimary: '#fff7ed',
        textSecondary: '#fed7aa',
        textMuted: '#fdba74',
        
        accent: '#fb923c',
        accentHover: '#f97316',
        border: 'rgba(249, 115, 22, 0.3)',
        borderLight: 'rgba(249, 115, 22, 0.2)',
        
        success: '#22c55e',
        warning: '#eab308',
        error: '#ef4444',
        info: '#f97316',
        
        buttonPrimary: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)',
        buttonSecondary: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
        
        inputBackground: 'rgba(234, 88, 12, 0.2)',
        inputBorder: 'rgba(249, 115, 22, 0.4)',
        inputFocus: '#f97316',
        inputPlaceholder: '#fdba74'
      }
    },
    {
      id: 'dark',
      name: 'dark',
      displayName: '🌙 Dark',
      colors: {
        primary: '#4f46e5',
        primaryLight: '#6366f1',
        primaryDark: '#3730a3',
        secondary: '#6b7280',
        secondaryLight: '#9ca3af',
        secondaryDark: '#4b5563',
        
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%)',
        backgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        surface: 'linear-gradient(145deg, rgba(55, 65, 81, 0.8) 0%, rgba(31, 41, 55, 0.9) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(55, 65, 81, 0.8) 0%, rgba(31, 41, 55, 0.9) 100%)',
        
        textPrimary: '#f9fafb',
        textSecondary: '#e5e7eb',
        textMuted: '#9ca3af',
        
        accent: '#818cf8',
        accentHover: '#6366f1',
        border: 'rgba(75, 85, 99, 0.3)',
        borderLight: 'rgba(75, 85, 99, 0.2)',
        
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#6366f1',
        
        buttonPrimary: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)',
        buttonSecondary: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #4b5563 0%, #6b7280 100%)',
        
        inputBackground: 'rgba(55, 65, 81, 0.3)',
        inputBorder: 'rgba(75, 85, 99, 0.4)',
        inputFocus: '#6366f1',
        inputPlaceholder: '#9ca3af'
      }
    },
    {
      id: 'light',
      name: 'light',
      displayName: '☀️ Light',
      colors: {
        primary: '#2563eb',
        primaryLight: '#3b82f6',
        primaryDark: '#1d4ed8',
        secondary: '#6b7280',
        secondaryLight: '#9ca3af',
        secondaryDark: '#4b5563',
        
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
        backgroundGradient: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
        surface: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
        
        textPrimary: '#0f172a',
        textSecondary: '#334155',
        textMuted: '#64748b',
        
        accent: '#3b82f6',
        accentHover: '#2563eb',
        border: 'rgba(203, 213, 225, 0.6)',
        borderLight: 'rgba(203, 213, 225, 0.4)',
        
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        
        buttonPrimary: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
        buttonSecondary: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #4b5563 0%, #6b7280 100%)',
        
        inputBackground: 'rgba(255, 255, 255, 0.8)',
        inputBorder: 'rgba(203, 213, 225, 0.6)',
        inputFocus: '#3b82f6',
        inputPlaceholder: '#64748b'
      }
    }
  ];

  constructor() {
    // Initialize the BehaviorSubject with the first theme (forest)
    const defaultTheme = this.themes[0]; // Forest theme
    this.currentThemeSubject = new BehaviorSubject<Theme>(defaultTheme);
    this.currentTheme$ = this.currentThemeSubject.asObservable();
    
    // Initialize default theme first
    this.applyTheme(defaultTheme);
    
    // Load saved theme or use default
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      const theme = this.themes.find(t => t.id === savedTheme);
      if (theme) {
        this.setTheme(theme);
      }
    }
  }

  getThemes(): Theme[] {
    return this.themes;
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  setTheme(theme: Theme): void {
    this.currentThemeSubject.next(theme);
    this.applyTheme(theme);
    localStorage.setItem('selectedTheme', theme.id);
  }

  setThemeById(themeId: string): void {
    const theme = this.themes.find(t => t.id === themeId);
    if (theme) {
      this.setTheme(theme);
    }
  }

  private getDefaultTheme(): Theme {
    // Return forest theme as default
    return this.themes.find(t => t.id === 'forest') || this.themes[0];
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--color-${this.kebabCase(key)}`;
      root.style.setProperty(cssVar, value);
    });
    
    // Set theme class on body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.id}`);
  }

  private kebabCase(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }
}
