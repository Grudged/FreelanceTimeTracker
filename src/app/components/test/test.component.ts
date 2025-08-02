import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="min-height: 100vh; background: linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #3d5a3d 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
      <div style="text-align: center; z-index: 999; position: relative;">
        <h1 style="color: #f0fff0 !important; font-size: 3rem; margin-bottom: 1rem;">Stack to the Future</h1>
        <p style="color: #e8f5e8 !important; font-size: 1.2rem;">Time Tracker - Test Page</p>
        <button style="background: #4a7c4a; color: white; padding: 1rem 2rem; border: none; border-radius: 8px; font-size: 1rem; margin-top: 1rem; cursor: pointer;">
          Test Button
        </button>
      </div>
    </div>
  `
})
export class TestComponent { }
