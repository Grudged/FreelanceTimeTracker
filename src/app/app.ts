import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('FreelanceTimeTracker');
  private themeService = inject(ThemeService);

  ngOnInit() {
    // Initialize theme service - this ensures themes are applied on app startup
    this.themeService.getCurrentTheme();
  }
}
