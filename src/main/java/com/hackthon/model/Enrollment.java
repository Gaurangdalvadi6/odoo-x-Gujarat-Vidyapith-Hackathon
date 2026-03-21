package com.hackthon.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private AppUser user;

    private boolean invited;
    private boolean purchased;

    private LocalDate enrolledDate = LocalDate.now();
    private LocalDate startDate;
    private LocalDate completedDate;
    private Integer timeSpentMinutes = 0;
    private Integer completionPercentage = 0;

    @Enumerated(EnumType.STRING)
    private Enums.EnrollmentStatus status = Enums.EnrollmentStatus.YET_TO_START;
}
