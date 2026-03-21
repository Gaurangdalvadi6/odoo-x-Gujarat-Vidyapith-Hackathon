package com.hackthon.controller;

import com.hackthon.model.Course;
import com.hackthon.model.Enrollment;
import com.hackthon.model.Lesson;
import com.hackthon.model.Quiz;
import com.hackthon.model.QuizOption;
import com.hackthon.model.QuizQuestion;
import com.hackthon.service.ElearningService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ElearningService elearningService;

    @GetMapping("/courses")
    public List<Course> courses() {
        return elearningService.allCourses();
    }

    @PostMapping("/courses")
    public Course createCourse(@RequestBody CreateCourseRequest request) {
        return elearningService.createCourse(request.title(), request.responsibleUserId());
    }

    @PutMapping("/courses/{courseId}")
    public Course updateCourse(@PathVariable Long courseId, @RequestBody Course payload) {
        return elearningService.updateCourse(courseId, payload);
    }

    @PatchMapping("/courses/{courseId}/publish")
    public Course publish(@PathVariable Long courseId, @RequestParam boolean value) {
        return elearningService.publishCourse(courseId, value);
    }

    @PostMapping("/courses/{courseId}/lessons")
    public Lesson addLesson(@PathVariable Long courseId, @RequestBody Lesson lesson) {
        return elearningService.addLesson(courseId, lesson);
    }

    @GetMapping("/courses/{courseId}/lessons")
    public List<Lesson> lessons(@PathVariable Long courseId) {
        return elearningService.courseLessons(courseId);
    }

    @PostMapping("/courses/{courseId}/quizzes")
    public Quiz addQuiz(@PathVariable Long courseId, @RequestBody Quiz quiz) {
        return elearningService.addQuiz(courseId, quiz);
    }

    @GetMapping("/courses/{courseId}/quizzes")
    public List<Quiz> quizzes(@PathVariable Long courseId) {
        return elearningService.courseQuizzes(courseId);
    }

    @PostMapping("/quizzes/{quizId}/questions")
    public QuizQuestion addQuestion(@PathVariable Long quizId, @RequestBody AddQuestionRequest request) {
        List<QuizOption> options = request.options().stream().map(opt -> {
            QuizOption option = new QuizOption();
            option.setText(opt.text());
            option.setCorrect(opt.correct());
            return option;
        }).toList();
        return elearningService.addQuizQuestion(quizId, request.text(), request.questionOrder(), options);
    }

    @GetMapping("/quizzes/{quizId}/questions")
    public List<QuizQuestionResponse> quizQuestions(@PathVariable Long quizId) {
        List<QuizQuestion> questions = elearningService.quizQuestions(quizId);
        return questions.stream().map(question -> new QuizQuestionResponse(
                question.getId(),
                question.getText(),
                question.getQuestionOrder(),
                elearningService.questionOptions(question.getId()).stream()
                        .map(option -> new QuestionOptionAdminResponse(option.getId(), option.getText(), option.isCorrect()))
                        .toList()
        )).toList();
    }

    @DeleteMapping("/quizzes/questions/{questionId}")
    public void deleteQuestion(@PathVariable Long questionId) {
        elearningService.deleteQuizQuestion(questionId);
    }

    @PostMapping("/courses/{courseId}/attendees")
    public Enrollment addAttendee(@PathVariable Long courseId, @RequestParam Long userId) {
        return elearningService.enroll(courseId, userId, true, false);
    }

    @PostMapping("/courses/{courseId}/attendees/invite")
    public Enrollment inviteAttendee(@PathVariable Long courseId, @RequestBody InviteAttendeeRequest request) {
        return elearningService.inviteAttendeeByEmail(courseId, request.email());
    }

    @PostMapping("/courses/{courseId}/attendees/contact")
    public Object contactAttendees(@PathVariable Long courseId, @RequestBody ContactAttendeesRequest request) {
        return elearningService.contactAttendees(courseId, request.subject(), request.message());
    }

    @GetMapping("/reports/courses/{courseId}")
    public List<Enrollment> courseReport(@PathVariable Long courseId) {
        return elearningService.reportByCourse(courseId);
    }

    public record CreateCourseRequest(@NotBlank String title, Long responsibleUserId) {
    }

    public record AddQuestionRequest(@NotBlank String text, @NotNull Integer questionOrder, List<QuestionOptionInput> options) {
    }

    public record QuestionOptionInput(@NotBlank String text, boolean correct) {
    }

    public record InviteAttendeeRequest(@NotBlank String email) {
    }

    public record ContactAttendeesRequest(@NotBlank String subject, @NotBlank String message) {
    }

    public record QuestionOptionAdminResponse(Long id, String text, boolean correct) {
    }

    public record QuizQuestionResponse(Long id, String text, Integer questionOrder, List<QuestionOptionAdminResponse> options) {
    }
}
