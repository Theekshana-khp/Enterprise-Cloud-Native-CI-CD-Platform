package com.taskmanager.repository;

import com.taskmanager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    java.util.List<Task> findByUserIdOrderByCreatedAtDesc(Long userId);

    java.util.Optional<Task> findByIdAndUserId(Long id, Long userId);
}
