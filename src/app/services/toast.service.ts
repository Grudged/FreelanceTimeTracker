import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: ToastAction[];
}

export interface ToastAction {
  label: string;
  handler: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  show(toast: Omit<Toast, 'id'>): void {
    const newToast: Toast = {
      ...toast,
      id: this.generateId(),
      duration: toast.duration ?? 4000
    };

    const currentToasts = this.toastsSubject.value;
    // Always emit a new array to ensure change detection
    this.toastsSubject.next([...currentToasts, newToast]);

    console.log('Toast added:', newToast.title, 'Total toasts:', this.toastsSubject.value.length);

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.remove(newToast.id);
      }, newToast.duration);
    }
  }

  success(title: string, message: string, duration?: number): void {
    this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number): void {
    this.show({ type: 'error', title, message, duration: duration ?? 6000 });
  }

  warning(title: string, message: string, duration?: number): void {
    this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number): void {
    this.show({ type: 'info', title, message, duration });
  }

  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    const newToasts = currentToasts.filter(toast => toast.id !== id);
    // Always emit a new array to ensure change detection
    this.toastsSubject.next([...newToasts]);
    
    console.log('Toast removed:', id, 'Remaining toasts:', newToasts.length);
  }

  clear(): void {
    this.toastsSubject.next([]);
  }
}