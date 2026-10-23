package com.quizmaster.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "google_sub", unique = true, nullable = false, length = 128)
    private String googleSub;

    @Column(name = "display_name", nullable = false, length = 150)
    private String displayName;

    @Column(unique = true, nullable = false, length = 191)
    private String email;

    @Column(name = "picture_url", length = 512)
    private String pictureUrl;

    @Column(name = "email_verified")
    private Boolean emailVerified;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", length = 20)
    private AccountStatus accountStatus;

    public enum UserRole {
        STUDENT,
        ADMIN
    }

    public enum AccountStatus {
        ACTIVE,
        SUSPENDED
    }

    @PrePersist
    public void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.lastLogin == null) {
            this.lastLogin = LocalDateTime.now();
        }
        if (this.accountStatus == null) {
            this.accountStatus = AccountStatus.ACTIVE;
        }
    }
}
