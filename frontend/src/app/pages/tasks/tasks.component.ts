import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { TaskItem } from '../../models/task.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent implements OnInit {
  tasks: TaskItem[] = [];
  loading = false;
  errorMessage = '';
  editingTaskId: number | null = null;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    public authService: AuthService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      scheduledAt: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  get isEditing(): boolean {
    return this.editingTaskId !== null;
  }

  get pendingCount(): number {
    return this.tasks.filter((t) => !t.isCompleted).length;
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getAll().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load your tasks. Try refreshing the page.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';

    const payload = {
      title: this.form.value.title!.trim(),
      description: (this.form.value.description ?? '').trim(),
      scheduledAt: new Date(this.form.value.scheduledAt!).toISOString()
    };

    if (this.editingTaskId !== null) {
      const existing = this.tasks.find((t) => t.id === this.editingTaskId);
      this.taskService
        .update(this.editingTaskId, { ...payload, isCompleted: existing?.isCompleted ?? false })
        .subscribe({
          next: () => {
            this.resetForm();
            this.loadTasks();
          },
          error: () => (this.errorMessage = 'Could not update this task.')
        });
    } else {
      this.taskService.create(payload).subscribe({
        next: () => {
          this.resetForm();
          this.loadTasks();
        },
        error: () => (this.errorMessage = 'Could not create this task.')
      });
    }
  }

  editTask(task: TaskItem): void {
    this.editingTaskId = task.id;
    this.form.setValue({
      title: task.title,
      description: task.description ?? '',
      scheduledAt: this.toDateTimeLocal(task.scheduledAt)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteTask(task: TaskItem): void {
    if (!confirm(`Delete "${task.title}"? This can't be undone.`)) return;

    this.taskService.delete(task.id).subscribe({
      next: () => {
        if (this.editingTaskId === task.id) this.resetForm();
        this.loadTasks();
      },
      error: () => (this.errorMessage = 'Could not delete this task.')
    });
  }

  toggleComplete(task: TaskItem): void {
    this.taskService
      .update(task.id, {
        title: task.title,
        description: task.description ?? '',
        scheduledAt: task.scheduledAt,
        isCompleted: !task.isCompleted
      })
      .subscribe({
        next: () => this.loadTasks(),
        error: () => (this.errorMessage = 'Could not update this task.')
      });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  logout(): void {
    this.authService.logout();
  }

  private resetForm(): void {
    this.editingTaskId = null;
    this.form.reset({ title: '', description: '', scheduledAt: '' });
  }

  private toDateTimeLocal(isoString: string): string {
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  }
}
