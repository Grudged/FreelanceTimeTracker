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
    // Material Design Inspired Themes
    {
      id: 'material-blue',
      name: 'material-blue',
      displayName: '💎 Material Blue',
      colors: {
        primary: '#1976d2',
        primaryLight: '#42a5f5',
        primaryDark: '#0d47a1',
        secondary: '#424242',
        secondaryLight: '#757575',
        secondaryDark: '#212121',
        
        background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
        backgroundGradient: 'linear-gradient(135deg, #0a2e5c 0%, #0d47a1 50%, #1565c0 100%)',
        surface: 'linear-gradient(145deg, rgba(25, 118, 210, 0.1) 0%, rgba(13, 71, 161, 0.15) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(25, 118, 210, 0.1) 0%, rgba(13, 71, 161, 0.15) 100%)',
        
        textPrimary: '#ffffff',
        textSecondary: '#e3f2fd',
        textMuted: '#bbdefb',
        
        accent: '#2196f3',
        accentHover: '#1976d2',
        border: 'rgba(33, 150, 243, 0.3)',
        borderLight: 'rgba(33, 150, 243, 0.2)',
        
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3',
        
        buttonPrimary: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)',
        buttonSecondary: 'linear-gradient(135deg, #424242 0%, #757575 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #212121 0%, #424242 100%)',
        
        inputBackground: 'rgba(25, 118, 210, 0.1)',
        inputBorder: 'rgba(33, 150, 243, 0.4)',
        inputFocus: '#2196f3',
        inputPlaceholder: '#bbdefb'
      }
    },
    {
      id: 'material-green',
      name: 'material-green',
      displayName: '🌿 Material Green',
      colors: {
        primary: '#388e3c',
        primaryLight: '#66bb6a',
        primaryDark: '#1b5e20',
        secondary: '#757575',
        secondaryLight: '#9e9e9e',
        secondaryDark: '#424242',
        
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)',
        backgroundGradient: 'linear-gradient(135deg, #0f3e14 0%, #1b5e20 50%, #2e7d32 100%)',
        surface: 'linear-gradient(145deg, rgba(56, 142, 60, 0.1) 0%, rgba(27, 94, 32, 0.15) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(56, 142, 60, 0.1) 0%, rgba(27, 94, 32, 0.15) 100%)',
        
        textPrimary: '#ffffff',
        textSecondary: '#e8f5e8',
        textMuted: '#c8e6c9',
        
        accent: '#4caf50',
        accentHover: '#388e3c',
        border: 'rgba(76, 175, 80, 0.3)',
        borderLight: 'rgba(76, 175, 80, 0.2)',
        
        success: '#66bb6a',
        warning: '#ffa726',
        error: '#ef5350',
        info: '#42a5f5',
        
        buttonPrimary: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)',
        buttonSecondary: 'linear-gradient(135deg, #757575 0%, #9e9e9e 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #424242 0%, #757575 100%)',
        
        inputBackground: 'rgba(56, 142, 60, 0.1)',
        inputBorder: 'rgba(76, 175, 80, 0.4)',
        inputFocus: '#4caf50',
        inputPlaceholder: '#c8e6c9'
      }
    },
    {
      id: 'dracula',
      name: 'dracula',
      displayName: '🧛 Dracula',
      colors: {
        primary: '#bd93f9',
        primaryLight: '#d6acff',
        primaryDark: '#9580d6',
        secondary: '#6272a4',
        secondaryLight: '#8592c7',
        secondaryDark: '#44475a',
        
        background: 'linear-gradient(135deg, #282a36 0%, #373844 50%, #44475a 100%)',
        backgroundGradient: 'linear-gradient(135deg, #21222c 0%, #282a36 50%, #373844 100%)',
        surface: 'linear-gradient(145deg, rgba(68, 71, 90, 0.9) 0%, rgba(40, 42, 54, 0.95) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(68, 71, 90, 0.9) 0%, rgba(40, 42, 54, 0.95) 100%)',
        
        textPrimary: '#f8f8f2',
        textSecondary: '#f8f8f2',
        textMuted: '#6272a4',
        
        accent: '#50fa7b',
        accentHover: '#5af78e',
        border: 'rgba(68, 71, 90, 0.5)',
        borderLight: 'rgba(68, 71, 90, 0.3)',
        
        success: '#50fa7b',
        warning: '#ffb86c',
        error: '#ff5555',
        info: '#8be9fd',
        
        buttonPrimary: 'linear-gradient(135deg, #bd93f9 0%, #d6acff 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #9580d6 0%, #bd93f9 100%)',
        buttonSecondary: 'linear-gradient(135deg, #6272a4 0%, #8592c7 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #44475a 0%, #6272a4 100%)',
        
        inputBackground: 'rgba(68, 71, 90, 0.5)',
        inputBorder: 'rgba(98, 114, 164, 0.5)',
        inputFocus: '#bd93f9',
        inputPlaceholder: '#6272a4'
      }
    },
    {
      id: 'nord',
      name: 'nord',
      displayName: '❄️ Nord',
      colors: {
        primary: '#5e81ac',
        primaryLight: '#81a1c1',
        primaryDark: '#4c566a',
        secondary: '#d08770',
        secondaryLight: '#ebcb8b',
        secondaryDark: '#bf616a',
        
        background: 'linear-gradient(135deg, #2e3440 0%, #3b4252 50%, #434c5e 100%)',
        backgroundGradient: 'linear-gradient(135deg, #242933 0%, #2e3440 50%, #3b4252 100%)',
        surface: 'linear-gradient(145deg, rgba(67, 76, 94, 0.9) 0%, rgba(46, 52, 64, 0.95) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(67, 76, 94, 0.9) 0%, rgba(46, 52, 64, 0.95) 100%)',
        
        textPrimary: '#eceff4',
        textSecondary: '#e5e9f0',
        textMuted: '#d8dee9',
        
        accent: '#88c0d0',
        accentHover: '#8fbcbb',
        border: 'rgba(76, 86, 106, 0.5)',
        borderLight: 'rgba(76, 86, 106, 0.3)',
        
        success: '#a3be8c',
        warning: '#ebcb8b',
        error: '#bf616a',
        info: '#5e81ac',
        
        buttonPrimary: 'linear-gradient(135deg, #5e81ac 0%, #81a1c1 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #4c566a 0%, #5e81ac 100%)',
        buttonSecondary: 'linear-gradient(135deg, #d08770 0%, #ebcb8b 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #bf616a 0%, #d08770 100%)',
        
        inputBackground: 'rgba(76, 86, 106, 0.3)',
        inputBorder: 'rgba(94, 129, 172, 0.4)',
        inputFocus: '#88c0d0',
        inputPlaceholder: '#d8dee9'
      }
    },
    {
      id: 'monokai',
      name: 'monokai',
      displayName: '🌃 Monokai',
      colors: {
        primary: '#f92672',
        primaryLight: '#ff6d9d',
        primaryDark: '#c91951',
        secondary: '#66d9ef',
        secondaryLight: '#8de4f0',
        secondaryDark: '#4ac0d9',
        
        background: 'linear-gradient(135deg, #272822 0%, #2f2f23 50%, #383830 100%)',
        backgroundGradient: 'linear-gradient(135deg, #1e1f1c 0%, #272822 50%, #2f2f23 100%)',
        surface: 'linear-gradient(145deg, rgba(56, 56, 48, 0.9) 0%, rgba(39, 40, 34, 0.95) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(56, 56, 48, 0.9) 0%, rgba(39, 40, 34, 0.95) 100%)',
        
        textPrimary: '#f8f8f2',
        textSecondary: '#f8f8f2',
        textMuted: '#75715e',
        
        accent: '#a6e22e',
        accentHover: '#b8e844',
        border: 'rgba(117, 113, 94, 0.5)',
        borderLight: 'rgba(117, 113, 94, 0.3)',
        
        success: '#a6e22e',
        warning: '#fd971f',
        error: '#f92672',
        info: '#66d9ef',
        
        buttonPrimary: 'linear-gradient(135deg, #f92672 0%, #ff6d9d 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #c91951 0%, #f92672 100%)',
        buttonSecondary: 'linear-gradient(135deg, #66d9ef 0%, #8de4f0 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #4ac0d9 0%, #66d9ef 100%)',
        
        inputBackground: 'rgba(117, 113, 94, 0.2)',
        inputBorder: 'rgba(166, 226, 46, 0.4)',
        inputFocus: '#a6e22e',
        inputPlaceholder: '#75715e'
      }
    },
    {
      id: 'catppuccin',
      name: 'catppuccin',
      displayName: '🌸 Catppuccin',
      colors: {
        primary: '#cba6f7',
        primaryLight: '#d5b3ff',
        primaryDark: '#b794f6',
        secondary: '#89b4fa',
        secondaryLight: '#a6c8ff',
        secondaryDark: '#6c96f7',
        
        background: 'linear-gradient(135deg, #1e1e2e 0%, #262537 50%, #313244 100%)',
        backgroundGradient: 'linear-gradient(135deg, #11111b 0%, #1e1e2e 50%, #262537 100%)',
        surface: 'linear-gradient(145deg, rgba(49, 50, 68, 0.9) 0%, rgba(30, 30, 46, 0.95) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(49, 50, 68, 0.9) 0%, rgba(30, 30, 46, 0.95) 100%)',
        
        textPrimary: '#cdd6f4',
        textSecondary: '#bac2de',
        textMuted: '#a6adc8',
        
        accent: '#f5c2e7',
        accentHover: '#f2cdcd',
        border: 'rgba(166, 173, 200, 0.3)',
        borderLight: 'rgba(166, 173, 200, 0.2)',
        
        success: '#a6e3a1',
        warning: '#f9e2af',
        error: '#f38ba8',
        info: '#89dceb',
        
        buttonPrimary: 'linear-gradient(135deg, #cba6f7 0%, #d5b3ff 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #b794f6 0%, #cba6f7 100%)',
        buttonSecondary: 'linear-gradient(135deg, #89b4fa 0%, #a6c8ff 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #6c96f7 0%, #89b4fa 100%)',
        
        inputBackground: 'rgba(49, 50, 68, 0.5)',
        inputBorder: 'rgba(166, 173, 200, 0.4)',
        inputFocus: '#f5c2e7',
        inputPlaceholder: '#a6adc8'
      }
    },
    {
      id: 'cyberpunk',
      name: 'cyberpunk',
      displayName: '🤖 Cyberpunk',
      colors: {
        primary: '#00ffff',
        primaryLight: '#33ffff',
        primaryDark: '#00cccc',
        secondary: '#ff0080',
        secondaryLight: '#ff33a0',
        secondaryDark: '#cc0066',
        
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 50%, #0a1a1a 100%)',
        backgroundGradient: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #1a0a1a 100%)',
        surface: 'linear-gradient(145deg, rgba(26, 10, 26, 0.9) 0%, rgba(10, 10, 10, 0.95) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(26, 10, 26, 0.9) 0%, rgba(10, 10, 10, 0.95) 100%)',
        
        textPrimary: '#00ffff',
        textSecondary: '#80ffff',
        textMuted: '#4dffff',
        
        accent: '#ff00ff',
        accentHover: '#ff33ff',
        border: 'rgba(0, 255, 255, 0.3)',
        borderLight: 'rgba(0, 255, 255, 0.2)',
        
        success: '#00ff80',
        warning: '#ffff00',
        error: '#ff0040',
        info: '#8000ff',
        
        buttonPrimary: 'linear-gradient(135deg, #00ffff 0%, #33ffff 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #00cccc 0%, #00ffff 100%)',
        buttonSecondary: 'linear-gradient(135deg, #ff0080 0%, #ff33a0 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #cc0066 0%, #ff0080 100%)',
        
        inputBackground: 'rgba(0, 255, 255, 0.1)',
        inputBorder: 'rgba(0, 255, 255, 0.4)',
        inputFocus: '#ff00ff',
        inputPlaceholder: '#4dffff'
      }
    },
    {
      id: 'minimal-light',
      name: 'minimal-light',
      displayName: '🤍 Minimal Light',
      colors: {
        primary: '#000000',
        primaryLight: '#333333',
        primaryDark: '#000000',
        secondary: '#666666',
        secondaryLight: '#999999',
        secondaryDark: '#333333',
        
        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 50%, #f5f5f5 100%)',
        backgroundGradient: 'linear-gradient(135deg, #ffffff 0%, #fefefe 50%, #fafafa 100%)',
        surface: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 250, 0.9) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 250, 0.9) 100%)',
        
        textPrimary: '#000000',
        textSecondary: '#333333',
        textMuted: '#666666',
        
        accent: '#000000',
        accentHover: '#333333',
        border: 'rgba(0, 0, 0, 0.1)',
        borderLight: 'rgba(0, 0, 0, 0.05)',
        
        success: '#00aa00',
        warning: '#ff8800',
        error: '#dd0000',
        info: '#0077dd',
        
        buttonPrimary: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #333333 0%, #000000 100%)',
        buttonSecondary: 'linear-gradient(135deg, #666666 0%, #999999 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #333333 0%, #666666 100%)',
        
        inputBackground: 'rgba(0, 0, 0, 0.02)',
        inputBorder: 'rgba(0, 0, 0, 0.1)',
        inputFocus: '#000000',
        inputPlaceholder: '#666666'
      }
    },
    {
      id: 'tokyo-night',
      name: 'tokyo-night',
      displayName: '🌙 Tokyo Night',
      colors: {
        primary: '#7aa2f7',
        primaryLight: '#9bb5ff',
        primaryDark: '#5a7ee0',
        secondary: '#bb9af7',
        secondaryLight: '#c9a9ff',
        secondaryDark: '#a688e0',
        
        background: 'linear-gradient(135deg, #1a1b26 0%, #24283b 50%, #414868 100%)',
        backgroundGradient: 'linear-gradient(135deg, #16161e 0%, #1a1b26 50%, #24283b 100%)',
        surface: 'linear-gradient(145deg, rgba(65, 72, 104, 0.15) 0%, rgba(26, 27, 38, 0.95) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(65, 72, 104, 0.15) 0%, rgba(26, 27, 38, 0.95) 100%)',
        
        textPrimary: '#c0caf5',
        textSecondary: '#a9b1d6',
        textMuted: '#565f89',
        
        accent: '#7dcfff',
        accentHover: '#89ddff',
        border: 'rgba(65, 72, 104, 0.4)',
        borderLight: 'rgba(65, 72, 104, 0.2)',
        
        success: '#9ece6a',
        warning: '#e0af68',
        error: '#f7768e',
        info: '#7dcfff',
        
        buttonPrimary: 'linear-gradient(135deg, #7aa2f7 0%, #9bb5ff 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #5a7ee0 0%, #7aa2f7 100%)',
        buttonSecondary: 'linear-gradient(135deg, #bb9af7 0%, #c9a9ff 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #a688e0 0%, #bb9af7 100%)',
        
        inputBackground: 'rgba(36, 40, 59, 0.8)',
        inputBorder: 'rgba(65, 72, 104, 0.6)',
        inputFocus: '#7dcfff',
        inputPlaceholder: '#565f89'
      }
    },
    {
      id: 'solarized-light',
      name: 'solarized-light',
      displayName: '☀️ Solarized Light',
      colors: {
        primary: '#268bd2',
        primaryLight: '#4aa5e5',
        primaryDark: '#1c6fa0',
        secondary: '#859900',
        secondaryLight: '#a3b300',
        secondaryDark: '#6b7800',
        
        background: 'linear-gradient(135deg, #fdf6e3 0%, #eee8d5 50%, #e3dcc4 100%)',
        backgroundGradient: 'linear-gradient(135deg, #fdf6e3 0%, #f7f0dd 50%, #eee8d5 100%)',
        surface: 'linear-gradient(145deg, rgba(253, 246, 227, 0.9) 0%, rgba(238, 232, 213, 0.8) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(253, 246, 227, 0.9) 0%, rgba(238, 232, 213, 0.8) 100%)',
        
        textPrimary: '#002b36',
        textSecondary: '#073642',
        textMuted: '#586e75',
        
        accent: '#2aa198',
        accentHover: '#35c9be',
        border: 'rgba(147, 161, 161, 0.4)',
        borderLight: 'rgba(147, 161, 161, 0.2)',
        
        success: '#859900',
        warning: '#b58900',
        error: '#dc322f',
        info: '#268bd2',
        
        buttonPrimary: 'linear-gradient(135deg, #268bd2 0%, #4aa5e5 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #1c6fa0 0%, #268bd2 100%)',
        buttonSecondary: 'linear-gradient(135deg, #859900 0%, #a3b300 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #6b7800 0%, #859900 100%)',
        
        inputBackground: 'rgba(238, 232, 213, 0.6)',
        inputBorder: 'rgba(147, 161, 161, 0.4)',
        inputFocus: '#2aa198',
        inputPlaceholder: '#586e75'
      }
    },
    {
      id: 'solarized-dark',
      name: 'solarized-dark',
      displayName: '🌙 Solarized Dark',
      colors: {
        primary: '#268bd2',
        primaryLight: '#4aa5e5',
        primaryDark: '#1c6fa0',
        secondary: '#859900',
        secondaryLight: '#a3b300',
        secondaryDark: '#6b7800',
        
        background: 'linear-gradient(135deg, #002b36 0%, #073642 50%, #0f4a57 100%)',
        backgroundGradient: 'linear-gradient(135deg, #001e26 0%, #002b36 50%, #073642 100%)',
        surface: 'linear-gradient(145deg, rgba(7, 54, 66, 0.9) 0%, rgba(0, 43, 54, 0.95) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(7, 54, 66, 0.9) 0%, rgba(0, 43, 54, 0.95) 100%)',
        
        textPrimary: '#839496',
        textSecondary: '#657b83',
        textMuted: '#586e75',
        
        accent: '#2aa198',
        accentHover: '#35c9be',
        border: 'rgba(88, 110, 117, 0.4)',
        borderLight: 'rgba(88, 110, 117, 0.2)',
        
        success: '#859900',
        warning: '#b58900',
        error: '#dc322f',
        info: '#268bd2',
        
        buttonPrimary: 'linear-gradient(135deg, #268bd2 0%, #4aa5e5 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #1c6fa0 0%, #268bd2 100%)',
        buttonSecondary: 'linear-gradient(135deg, #859900 0%, #a3b300 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #6b7800 0%, #859900 100%)',
        
        inputBackground: 'rgba(7, 54, 66, 0.8)',
        inputBorder: 'rgba(88, 110, 117, 0.6)',
        inputFocus: '#2aa198',
        inputPlaceholder: '#586e75'
      }
    },
    {
      id: 'ibm-carbon',
      name: 'ibm-carbon',
      displayName: '🏢 IBM Carbon',
      colors: {
        primary: '#0f62fe',
        primaryLight: '#4589ff',
        primaryDark: '#002d9c',
        secondary: '#393939',
        secondaryLight: '#6f6f6f',
        secondaryDark: '#161616',
        
        background: 'linear-gradient(135deg, #161616 0%, #262626 50%, #393939 100%)',
        backgroundGradient: 'linear-gradient(135deg, #000000 0%, #161616 50%, #262626 100%)',
        surface: 'linear-gradient(145deg, rgba(57, 57, 57, 0.8) 0%, rgba(22, 22, 22, 0.95) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(57, 57, 57, 0.8) 0%, rgba(22, 22, 22, 0.95) 100%)',
        
        textPrimary: '#f4f4f4',
        textSecondary: '#c6c6c6',
        textMuted: '#8d8d8d',
        
        accent: '#33b1ff',
        accentHover: '#0f62fe',
        border: 'rgba(141, 141, 141, 0.3)',
        borderLight: 'rgba(141, 141, 141, 0.2)',
        
        success: '#24a148',
        warning: '#f1c21b',
        error: '#da1e28',
        info: '#0f62fe',
        
        buttonPrimary: 'linear-gradient(135deg, #0f62fe 0%, #4589ff 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #002d9c 0%, #0f62fe 100%)',
        buttonSecondary: 'linear-gradient(135deg, #393939 0%, #6f6f6f 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #161616 0%, #393939 100%)',
        
        inputBackground: 'rgba(38, 38, 38, 0.8)',
        inputBorder: 'rgba(141, 141, 141, 0.4)',
        inputFocus: '#0f62fe',
        inputPlaceholder: '#8d8d8d'
      }
    },
    {
      id: 'one-dark',
      name: 'one-dark',
      displayName: '🌊 One Dark',
      colors: {
        primary: '#61afef',
        primaryLight: '#84c5f4',
        primaryDark: '#4e9be9',
        secondary: '#c678dd',
        secondaryLight: '#d19ae7',
        secondaryDark: '#b665d1',
        
        background: 'linear-gradient(135deg, #282c34 0%, #2c313c 50%, #3e4451 100%)',
        backgroundGradient: 'linear-gradient(135deg, #21252b 0%, #282c34 50%, #2c313c 100%)',
        surface: 'linear-gradient(145deg, rgba(62, 68, 81, 0.9) 0%, rgba(40, 44, 52, 0.95) 100%)',
        surfaceGradient: 'linear-gradient(145deg, rgba(62, 68, 81, 0.9) 0%, rgba(40, 44, 52, 0.95) 100%)',
        
        textPrimary: '#abb2bf',
        textSecondary: '#9da5b4',
        textMuted: '#5c6370',
        
        accent: '#56b6c2',
        accentHover: '#66c8d4',
        border: 'rgba(92, 99, 112, 0.4)',
        borderLight: 'rgba(92, 99, 112, 0.2)',
        
        success: '#98c379',
        warning: '#e5c07b',
        error: '#e06c75',
        info: '#61afef',
        
        buttonPrimary: 'linear-gradient(135deg, #61afef 0%, #84c5f4 100%)',
        buttonPrimaryHover: 'linear-gradient(135deg, #4e9be9 0%, #61afef 100%)',
        buttonSecondary: 'linear-gradient(135deg, #c678dd 0%, #d19ae7 100%)',
        buttonSecondaryHover: 'linear-gradient(135deg, #b665d1 0%, #c678dd 100%)',
        
        inputBackground: 'rgba(44, 49, 60, 0.8)',
        inputBorder: 'rgba(92, 99, 112, 0.6)',
        inputFocus: '#56b6c2',
        inputPlaceholder: '#5c6370'
      }
    }
  ];

  constructor() {
    // Initialize the BehaviorSubject with the first theme (Material Blue)
    const defaultTheme = this.themes[0]; // Material Blue theme
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
