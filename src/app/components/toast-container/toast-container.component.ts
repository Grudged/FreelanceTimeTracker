import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css'
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('ToastContainer ngOnInit called');
    this.subscription.add(
      this.toastService.toasts$.subscribe(toasts => {
        console.log('ToastContainer received toasts:', toasts.length, toasts);
        this.toasts = toasts;
        // Use markForCheck instead of detectChanges to avoid timing issues
        this.cdr.markForCheck();
      })
    );
  }

  trackByToastId(index: number, toast: Toast): string {
    return toast.id;
  }

  getToastIcon(type: string): string {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type as keyof typeof icons] || 'ℹ️';
  }

  closeToast(id: string): void {
    this.toastService.remove(id);
    // Use markForCheck instead of detectChanges
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}