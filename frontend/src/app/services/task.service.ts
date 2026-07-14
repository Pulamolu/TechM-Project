import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskCreateRequest, TaskItem, TaskUpdateRequest } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>(this.apiUrl);
  }

  create(payload: TaskCreateRequest): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.apiUrl, payload);
  }

  update(id: number, payload: TaskUpdateRequest): Observable<TaskItem> {
    return this.http.put<TaskItem>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
