import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { PersistentTimerComponent } from './components/persistent-timer/persistent-timer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PersistentTimerComponent],
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
