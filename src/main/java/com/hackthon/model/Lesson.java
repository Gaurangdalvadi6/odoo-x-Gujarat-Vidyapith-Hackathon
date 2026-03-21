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
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id")
    private Course course;

    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private Enums.LessonType type;

    private String contentUrl;
    private Integer durationMinutes;
    private Boolean allowDownload = false;
    private String attachmentFileUrl;
    private String attachmentExternalUrl;
    private Integer lessonOrder;
}
