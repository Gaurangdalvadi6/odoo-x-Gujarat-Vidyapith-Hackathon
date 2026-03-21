package com.hackthon.controller;

import com.hackthon.model.Course;
import com.hackthon.model.Enrollment;
import com.hackthon.model.Lesson;
import com.hackthon.model.Quiz;
import com.hackthon.model.Review;
import com.hackthon.service.ElearningService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/learn")
@RequiredArgsConstructor
public class LearnerController {

    private final ElearningService elearningService;

    @GetMapping("/courses")
    public List<Course> browseCourses(@RequestParam(required = false) Long userId) {
        return elearningService.publishedCourses(userId);
    }

    @PostMapping("/courses/{courseId}/enroll")
    public Enrollment enroll(@PathVariable Long courseId, @RequestParam Long userId, @RequestParam(defaultValue = "false") boolean purchased) {
        return elearningService.enroll(courseId, userId, false, purchased);
    }

    @GetMapping("/my-courses/{userId}")
    public List<Enrollment> myCourses(@PathVariable Long userId) {
        return elearningService.userEnrollments(userId);
    }

    @GetMapping("/courses/{courseId}/lessons")
    public List<Lesson> lessons(@PathVariable Long courseId) {
        return elearningService.courseLessons(courseId);
    }

    @GetMapping("/courses/{courseId}/quizzes")
    public List<Quiz> quizzes(@PathVariable Long courseId) {
        return elearningService.courseQuizzes(courseId);
    }

    @PostMapping("/enrollments/{enrollmentId}/lessons/{lessonId}/complete")
    public Enrollment completeLesson(@PathVariable Long enrollmentId, @PathVariable Long lessonId) {
        return elearningService.completeLesson(enrollmentId, lessonId);
    }

    @PostMapping("/quizzes/{quizId}/submit")
    public Map<String, Object> submitQuiz(@PathVariable Long quizId, @RequestParam Long userId, @RequestBody SubmitQuizRequest request) {
        int points = elearningService.submitQuiz(quizId, userId, request.answers());
        return Map.of("message", "Quiz completed", "pointsEarned", points);
    }

    @PostMapping("/courses/{courseId}/reviews")
    public Review addReview(@PathVariable Long courseId, @RequestParam Long userId, @RequestBody ReviewRequest request) {
        return elearningService.addReview(courseId, userId, request.rating(), request.reviewText());
    }

    @GetMapping("/courses/{courseId}/reviews")
    public List<Review> reviews(@PathVariable Long courseId) {
        return elearningService.reviews(courseId);
    }

    public record SubmitQuizRequest(Map<Long, Long> answers) {
    }

    public record ReviewRequest(@Min(1) @Max(5) Integer rating, @NotBlank String reviewText) {
    }
}
