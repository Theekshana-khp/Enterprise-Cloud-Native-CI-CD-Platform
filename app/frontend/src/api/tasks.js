import { apiClient } from './client';

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED'];

export const STATUS_LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export async function fetchTasks() {
  const { data } = await apiClient.get('/tasks');
  return data;
}

export async function fetchTask(id) {
  const { data } = await apiClient.get(`/tasks/${id}`);
  return data;
}

export async function createTask(payload) {
  const { data } = await apiClient.post('/tasks', payload);
  return data;
}

export async function updateTask(id, payload) {
  const { data } = await apiClient.put(`/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id) {
  await apiClient.delete(`/tasks/${id}`);
}
