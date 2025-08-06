import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';

export interface ProjectFormData {
  title: string;
  client: string;
  description: string;
  isContract: boolean;
  hourlyRate: number;
  currency: string;
  estimatedHours?: number;
  tags: string[];
  notes?: string;
}

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="project-form-overlay" (click)="closeForm()">
      <div class="project-form-modal" (click)="$event.stopPropagation()">
        <div class="form-header">
          <h2>Create New Project</h2>
          <button class="close-btn" (click)="closeForm()" aria-label="Close form">×</button>
        </div>
        
        <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="project-form">
          <div class="form-row">
            <div class="form-group">
              <label for="title">Project Title *</label>
              <input
                type="text"
                id="title"
                formControlName="title"
                class="form-control"
                [class.error]="isFieldInvalid('title')"
                placeholder="Enter project title"
              />
              <div *ngIf="isFieldInvalid('title')" class="error-message">
                Project title is required
              </div>
            </div>
            
            <div class="form-group">
              <label for="client">Client *</label>
              <input
                type="text"
                id="client"
                formControlName="client"
                class="form-control"
                [class.error]="isFieldInvalid('client')"
                placeholder="Enter client name"
              />
              <div *ngIf="isFieldInvalid('client')" class="error-message">
                Client name is required
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              formControlName="description"
              class="form-control"
              rows="3"
              placeholder="Enter project description"
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="hourlyRate">Hourly Rate *</label>
              <div class="input-group">
                <select formControlName="currency" class="currency-select">
                  <option value="USD">$</option>
                  <option value="EUR">€</option>
                  <option value="GBP">£</option>
                  <option value="CAD">C$</option>
                  <option value="AUD">A$</option>
                </select>
                <input
                  type="number"
                  id="hourlyRate"
                  formControlName="hourlyRate"
                  class="form-control"
                  [class.error]="isFieldInvalid('hourlyRate')"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div *ngIf="isFieldInvalid('hourlyRate')" class="error-message">
                Hourly rate is required
              </div>
            </div>
            
            <div class="form-group">
              <label for="estimatedHours">Estimated Hours</label>
              <input
                type="number"
                id="estimatedHours"
                formControlName="estimatedHours"
                class="form-control"
                placeholder="0"
                min="0"
                step="0.5"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label>
              <input
                type="checkbox"
                formControlName="isContract"
                class="checkbox"
              />
              This is a contract project
            </label>
          </div>
          
          <div class="form-group">
            <label for="tags">Tags</label>
            <input
              type="text"
              id="tags"
              formControlName="tagsInput"
              class="form-control"
              placeholder="Enter tags separated by commas (e.g., Angular, Node.js, UI/UX)"
            />
            <small class="form-hint">Separate multiple tags with commas</small>
          </div>
          
          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea
              id="notes"
              formControlName="notes"
              class="form-control"
              rows="3"
              placeholder="Any additional notes about the project"
            ></textarea>
          </div>
          
          <div *ngIf="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="closeForm()">
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="projectForm.invalid || isLoading"
            >
              <span *ngIf="isLoading" class="spinner"></span>
              {{ isLoading ? 'Creating...' : 'Create Project' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .project-form-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000000;
      backdrop-filter: blur(4px);
    }
    
    .project-form-modal {
      background: var(--color-surface, linear-gradient(145deg, rgba(61, 79, 61, 0.95) 0%, rgba(45, 62, 45, 0.95) 100%));
      border: 1px solid var(--color-border, rgba(74, 124, 74, 0.3));
      border-radius: 16px;
      padding: 2rem;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(20px);
    }
    
    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border, rgba(74, 124, 74, 0.3));
    }
    
    .form-header h2 {
      margin: 0;
      color: var(--color-text-primary, #f0fff0);
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: var(--color-text-muted, #a0c0a0);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: all 0.3s ease;
    }
    
    .close-btn:hover {
      background: var(--color-border-light, rgba(74, 124, 74, 0.2));
      color: var(--color-text-primary, #f0fff0);
    }
    
    .project-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .form-group label {
      color: var(--color-text-primary, #f0fff0);
      font-weight: 500;
      font-size: 0.875rem;
    }
    
    .form-control, .currency-select {
      padding: 0.75rem;
      border: 2px solid var(--color-input-border, rgba(74, 124, 74, 0.4));
      border-radius: 8px;
      background: var(--color-input-background, rgba(45, 91, 45, 0.2));
      color: var(--color-text-primary, #e8f5e8);
      transition: all 0.3s ease;
      font-size: 0.875rem;
    }
    
    .form-control::placeholder {
      color: var(--color-input-placeholder, #a0c0a0);
    }
    
    .form-control:focus, .currency-select:focus {
      outline: none;
      border-color: var(--color-input-focus, #4a7c4a);
      box-shadow: 0 0 0 3px var(--color-border-light, rgba(74, 124, 74, 0.2));
    }
    
    .form-control.error {
      border-color: var(--color-error, #cd5c5c);
    }
    
    .input-group {
      display: flex;
      align-items: stretch;
    }
    
    .currency-select {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right: none;
      min-width: 80px;
    }
    
    .input-group .form-control {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      flex: 1;
    }
    
    .checkbox {
      width: auto !important;
      margin-right: 0.5rem;
    }
    
    .form-hint {
      color: var(--color-text-muted, #a0c0a0);
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    
    .error-message {
      color: var(--color-error, #cd5c5c);
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    
    .alert {
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    
    .alert-error {
      background: rgba(205, 92, 92, 0.2);
      color: var(--color-error, #cd5c5c);
      border: 1px solid var(--color-error, #cd5c5c);
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border, rgba(74, 124, 74, 0.3));
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-primary {
      background: var(--color-button-primary, linear-gradient(135deg, #2d5b2d 0%, #4a7c4a 100%));
      color: var(--color-text-primary, #f0fff0);
      box-shadow: 0 4px 12px rgba(45, 91, 45, 0.3);
    }
    
    .btn-primary:hover:not(:disabled) {
      background: var(--color-button-primary-hover, linear-gradient(135deg, #367d36 0%, #5a9c5a 100%));
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(45, 91, 45, 0.4);
    }
    
    .btn-primary:disabled {
      background: var(--color-border-light, rgba(74, 124, 74, 0.3));
      cursor: not-allowed;
      box-shadow: none;
    }
    
    .btn-secondary {
      background: var(--color-button-secondary, linear-gradient(135deg, #6b7280 0%, #9ca3af 100%));
      color: var(--color-text-primary, #f0fff0);
    }
    
    .btn-secondary:hover {
      background: var(--color-button-secondary-hover, linear-gradient(135deg, #4b5563 0%, #6b7280 100%));
      transform: translateY(-1px);
    }
    
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .project-form-modal {
        padding: 1.5rem;
        width: 95%;
        max-height: 95vh;
      }
      
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ProjectFormComponent implements OnInit {
  @Output() formClosed = new EventEmitter<void>();
  @Output() projectCreated = new EventEmitter<any>();

  projectForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' }
  ];

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService
  ) {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      client: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(1000)]],
      isContract: [false],
      hourlyRate: ['', [Validators.required, Validators.min(0)]],
      currency: ['USD'],
      estimatedHours: ['', [Validators.min(0)]],
      tagsInput: [''],
      notes: ['', [Validators.maxLength(2000)]]
    });
  }

  ngOnInit(): void {
    // Focus on title field when form opens
    setTimeout(() => {
      const titleInput = document.getElementById('title') as HTMLInputElement;
      if (titleInput) {
        titleInput.focus();
      }
    }, 100);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.projectForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  closeForm(): void {
    this.formClosed.emit();
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData = this.projectForm.value;
      
      // Parse tags from comma-separated string
      const tags = formData.tagsInput 
        ? formData.tagsInput.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : [];

      const projectData: ProjectFormData = {
        title: formData.title,
        client: formData.client,
        description: formData.description || '',
        isContract: formData.isContract,
        hourlyRate: parseFloat(formData.hourlyRate),
        currency: formData.currency,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        tags: tags,
        notes: formData.notes || ''
      };

      this.projectService.createProject(projectData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          console.log('Project created successfully:', response);
          this.projectCreated.emit(response);
          this.closeForm();
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Project creation error:', error);
          this.errorMessage = error.error?.message || 'Failed to create project. Please try again.';
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.projectForm.controls).forEach(key => {
        this.projectForm.get(key)?.markAsTouched();
      });
    }
  }
}