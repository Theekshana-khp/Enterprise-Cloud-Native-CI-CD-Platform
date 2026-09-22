package com.taskmanager.service;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public List<TaskResponse> findAll() {
        Long userId = currentUserService.requireUserId();
        return taskRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(TaskResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse findById(Long id) {
        return TaskResponse.fromEntity(getTaskOrThrow(id));
    }

    @Transactional
    public TaskResponse create(TaskRequest request) {
        Long userId = currentUserService.requireUserId();
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .project(request.getProject())
                .category(request.getCategory())
                .dueDate(request.getDueDate())
                .userId(userId)
                .build();
        return TaskResponse.fromEntity(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(Long id, TaskRequest request) {
        Task task = getTaskOrThrow(id);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        task.setProject(request.getProject());
        task.setCategory(request.getCategory());
        task.setDueDate(request.getDueDate());
        return TaskResponse.fromEntity(taskRepository.save(task));
    }

    @Transactional
    public void delete(Long id) {
        Task task = getTaskOrThrow(id);
        taskRepository.delete(task);
    }

    private Task getTaskOrThrow(Long id) {
        Long userId = currentUserService.requireUserId();
        return taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }
}
