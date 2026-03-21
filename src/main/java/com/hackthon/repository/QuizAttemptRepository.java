package com.hackthon.repository;

import com.hackthon.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    long countByQuizIdAndUserId(Long quizId, Long userId);
}
