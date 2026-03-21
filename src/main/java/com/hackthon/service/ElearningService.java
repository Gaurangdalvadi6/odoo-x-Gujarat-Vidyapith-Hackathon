package com.hackthon.service;

import com.hackthon.model.AppUser;
import com.hackthon.model.Course;
import com.hackthon.model.Enrollment;
import com.hackthon.model.Enums;
import com.hackthon.model.Lesson;
import com.hackthon.model.LessonProgress;
import com.hackthon.model.Quiz;
import com.hackthon.model.QuizAttempt;
import com.hackthon.model.QuizOption;
import com.hackthon.model.QuizQuestion;
import com.hackthon.model.Review;
import com.hackthon.repository.CourseRepository;
import com.hackthon.repository.EnrollmentRepository;
import com.hackthon.repository.LessonProgressRepository;
import com.hackthon.repository.LessonRepository;
import com.hackthon.repository.QuizAttemptRepository;
import com.hackthon.repository.QuizOptionRepository;
import com.hackthon.repository.QuizQuestionRepository;
import com.hackthon.repository.QuizRepository;
import com.hackthon.repository.ReviewRepository;
import com.hackthon.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class ElearningService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizOptionRepository quizOptionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ReviewRepository reviewRepository;

    public List<Course> publishedCourses(Long userId) {
        List<Course> published = courseRepository.findByPublishedTrue();
        if (userId == null) {
            return published.stream().filter(c -> c.getVisibility() == Enums.Visibility.EVERYONE).toList();
        }
        return published;
    }

    public List<Course> allCourses() {
        return courseRepository.findAll();
    }

    @Transactional
    public Course createCourse(String title, Long responsibleUserId) {
        Course course = new Course();
        course.setTitle(title);
        if (responsibleUserId != null) {
            course.setResponsibleUser(getUser(responsibleUserId));
        }
        return courseRepository.save(course);
    }

    @Transactional
    public Course updateCourse(Long courseId, Course payload) {
        Course course = getCourse(courseId);
        course.setTitle(payload.getTitle());
        course.setTags(payload.getTags());
        course.setShortDescription(payload.getShortDescription());
        course.setDescription(payload.getDescription());
        course.setCoverImageUrl(payload.getCoverImageUrl());
        course.setWebsite(payload.getWebsite());
        course.setVisibility(payload.getVisibility());
        course.setAccessRule(payload.getAccessRule());
        course.setPrice(payload.getPrice());
        if (payload.getResponsibleUser() != null && payload.getResponsibleUser().getId() != null) {
            course.setResponsibleUser(getUser(payload.getResponsibleUser().getId()));
        }
        return courseRepository.save(course);
    }

    @Transactional
    public Course publishCourse(Long courseId, boolean published) {
        Course course = getCourse(courseId);
        if (published && (course.getWebsite() == null || course.getWebsite().isBlank())) {
            throw new ResponseStatusException(BAD_REQUEST, "Website is required before publishing.");
        }
        course.setPublished(published);
        return courseRepository.save(course);
    }

    @Transactional
    public Lesson addLesson(Long courseId, Lesson lesson) {
        Course course = getCourse(courseId);
        lesson.setCourse(course);
        return lessonRepository.save(lesson);
    }

    public List<Lesson> courseLessons(Long courseId) {
        return lessonRepository.findByCourseIdOrderByLessonOrderAsc(courseId);
    }

    @Transactional
    public Quiz addQuiz(Long courseId, Quiz quiz) {
        quiz.setCourse(getCourse(courseId));
        return quizRepository.save(quiz);
    }

    @Transactional
    public QuizQuestion addQuizQuestion(Long quizId, String text, Integer order, List<QuizOption> options) {
        QuizQuestion question = new QuizQuestion();
        question.setQuiz(getQuiz(quizId));
        question.setText(text);
        question.setQuestionOrder(order);
        question = quizQuestionRepository.save(question);
        for (QuizOption option : options) {
            option.setQuestion(question);
            quizOptionRepository.save(option);
        }
        return question;
    }

    @Transactional
    public Enrollment enroll(Long courseId, Long userId, boolean invited, boolean purchased) {
        Course course = getCourse(courseId);
        AppUser user = getUser(userId);
        return enrollmentRepository.findByCourseIdAndUserId(courseId, userId).orElseGet(() -> {
            Enrollment enrollment = new Enrollment();
            enrollment.setCourse(course);
            enrollment.setUser(user);
            enrollment.setInvited(invited);
            enrollment.setPurchased(purchased);
            enrollment.setEnrolledDate(LocalDate.now());
            return enrollmentRepository.save(enrollment);
        });
    }

    public List<Enrollment> userEnrollments(Long userId) {
        return enrollmentRepository.findByUserId(userId);
    }

    @Transactional
    public Enrollment completeLesson(Long enrollmentId, Long lessonId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Enrollment not found"));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Lesson not found"));

        LessonProgress progress = lessonProgressRepository.findByEnrollmentIdAndLessonId(enrollmentId, lessonId)
                .orElseGet(() -> {
                    LessonProgress lp = new LessonProgress();
                    lp.setEnrollment(enrollment);
                    lp.setLesson(lesson);
                    return lp;
                });
        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        lessonProgressRepository.save(progress);

        if (enrollment.getStartDate() == null) {
            enrollment.setStartDate(LocalDate.now());
        }
        enrollment.setStatus(Enums.EnrollmentStatus.IN_PROGRESS);
        recalcCompletion(enrollment);
        return enrollmentRepository.save(enrollment);
    }

    @Transactional
    public int submitQuiz(Long quizId, Long userId, Map<Long, Long> answers) {
        Quiz quiz = getQuiz(quizId);
        AppUser user = getUser(userId);
        List<QuizQuestion> questions = quizQuestionRepository.findByQuizIdOrderByQuestionOrderAsc(quizId);
        if (questions.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Quiz has no questions.");
        }

        int correct = 0;
        for (QuizQuestion question : questions) {
            Long pickedOptionId = answers.get(question.getId());
            if (pickedOptionId == null) {
                continue;
            }
            QuizOption option = quizOptionRepository.findById(pickedOptionId)
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Invalid option id."));
            if (option.isCorrect()) {
                correct++;
            }
        }

        long attemptNumber = quizAttemptRepository.countByQuizIdAndUserId(quizId, userId) + 1;
        int basePoints = switch ((int) attemptNumber) {
            case 1 -> quiz.getFirstTryPoints();
            case 2 -> quiz.getSecondTryPoints();
            case 3 -> quiz.getThirdTryPoints();
            default -> quiz.getFourthPlusPoints();
        };
        int earned = (int) Math.round((correct * 1.0 / questions.size()) * basePoints);

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setUser(user);
        attempt.setAttemptNumber((int) attemptNumber);
        attempt.setScoreEarned(earned);
        quizAttemptRepository.save(attempt);

        user.setTotalPoints(user.getTotalPoints() + earned);
        user.setBadgeLevel(resolveBadge(user.getTotalPoints()));
        userRepository.save(user);
        return earned;
    }

    @Transactional
    public Review addReview(Long courseId, Long userId, Integer rating, String reviewText) {
        Review review = new Review();
        review.setCourse(getCourse(courseId));
        review.setUser(getUser(userId));
        review.setRating(rating);
        review.setReviewText(reviewText);
        return reviewRepository.save(review);
    }

    public List<Review> reviews(Long courseId) {
        return reviewRepository.findByCourseId(courseId);
    }

    public List<Enrollment> reportByCourse(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }

    private void recalcCompletion(Enrollment enrollment) {
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByLessonOrderAsc(enrollment.getCourse().getId());
        if (lessons.isEmpty()) {
            enrollment.setCompletionPercentage(0);
            return;
        }
        List<LessonProgress> progresses = lessonProgressRepository.findByEnrollmentId(enrollment.getId());
        long completed = progresses.stream().filter(LessonProgress::isCompleted).count();
        int percent = (int) ((completed * 100) / lessons.size());
        enrollment.setCompletionPercentage(percent);
        if (percent >= 100) {
            enrollment.setStatus(Enums.EnrollmentStatus.COMPLETED);
            enrollment.setCompletedDate(LocalDate.now());
        }
    }

    private Enums.BadgeLevel resolveBadge(int points) {
        if (points >= 120) return Enums.BadgeLevel.MASTER;
        if (points >= 100) return Enums.BadgeLevel.EXPERT;
        if (points >= 80) return Enums.BadgeLevel.SPECIALIST;
        if (points >= 60) return Enums.BadgeLevel.ACHIEVER;
        if (points >= 40) return Enums.BadgeLevel.EXPLORER;
        return Enums.BadgeLevel.NEWBIE;
    }

    private AppUser getUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
    }

    private Course getCourse(Long id) {
        return courseRepository.findById(id).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Course not found"));
    }

    private Quiz getQuiz(Long id) {
        return quizRepository.findById(id).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Quiz not found"));
    }
}
