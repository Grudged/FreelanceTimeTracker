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
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css'
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