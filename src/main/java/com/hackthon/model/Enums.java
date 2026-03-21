package com.hackthon.model;

public final class Enums {
    private Enums() {
    }

    public enum UserRole {
        ADMIN,
        INSTRUCTOR,
        LEARNER
    }

    public enum Visibility {
        EVERYONE,
        SIGNED_IN
    }

    public enum AccessRule {
        OPEN,
        INVITATION,
        PAYMENT
    }

    public enum LessonType {
        VIDEO,
        DOCUMENT,
        IMAGE,
        QUIZ
    }

    public enum EnrollmentStatus {
        YET_TO_START,
        IN_PROGRESS,
        COMPLETED
    }

    public enum BadgeLevel {
        NEWBIE,
        EXPLORER,
        ACHIEVER,
        SPECIALIST,
        EXPERT,
        MASTER
    }
}
