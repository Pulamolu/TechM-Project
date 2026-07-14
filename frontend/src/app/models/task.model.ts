export interface TaskItem {
  id: number;
  title: string;
  description?: string;
  scheduledAt: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  scheduledAt: string;
}

export interface TaskUpdateRequest extends TaskCreateRequest {
  isCompleted: boolean;
}
