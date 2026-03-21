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
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String tags;
    private String shortDescription;
    private String description;
    private String coverImageUrl;
    private String website;
    private boolean published;
    private long viewsCount;
    private Double price;

    @Enumerated(EnumType.STRING)
    private Enums.Visibility visibility = Enums.Visibility.EVERYONE;

    @Enumerated(EnumType.STRING)
    private Enums.AccessRule accessRule = Enums.AccessRule.OPEN;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "responsible_user_id")
    private AppUser responsibleUser;
}
