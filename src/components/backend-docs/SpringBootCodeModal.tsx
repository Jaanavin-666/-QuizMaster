import React, { useState } from 'react';
import { X, Check, Copy, Code, Terminal, Database, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SpringBootCodeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'security' | 'user' | 'oauth' | 'pom' | 'schema' | 'yml'>('security');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const files = {
    security: {
      filename: 'SecurityConfig.java',
      lang: 'java',
      content: `package com.quizmaster.config;

import com.quizmaster.service.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;

    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService) {
        this.customOAuth2UserService = customOAuth2UserService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/api/auth/status", "/api/subjects/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/quizzes/**", "/api/attempts/**").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .defaultSuccessUrl("http://localhost:3000/dashboard", true)
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .invalidateHttpSession(true)
                .deleteCookies("QUIZMASTER_SESSION_ID")
            );

        return http.build();
    }
}`,
    },
    user: {
      filename: 'User.java',
      lang: 'java',
      content: `package com.quizmaster.model;

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

    public enum UserRole {
        STUDENT,
        ADMIN
    }
}`,
    },
    oauth: {
      filename: 'CustomOAuth2UserService.java',
      lang: 'java',
      content: `package com.quizmaster.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Value("\${quizmaster.admin-emails:}")
    private List<String> adminEmails;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        boolean isAdmin = adminEmails != null && adminEmails.contains(email);

        String authorityRole = isAdmin ? "ROLE_ADMIN" : "ROLE_STUDENT";
        Set<SimpleGrantedAuthority> authorities = Collections.singleton(new SimpleGrantedAuthority(authorityRole));

        return new DefaultOAuth2User(authorities, attributes, "sub");
    }
}`,
    },
    schema: {
      filename: 'schema.sql',
      lang: 'sql',
      content: `CREATE DATABASE IF NOT EXISTS quizmaster_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quizmaster_db;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    google_sub VARCHAR(128) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    picture_url VARCHAR(512),
    email_verified BOOLEAN DEFAULT TRUE,
    role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_google_sub (google_sub)
);

CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(64) PRIMARY KEY,
    subject_id VARCHAR(64) NOT NULL,
    question_en TEXT NOT NULL,
    question_ta TEXT NOT NULL,
    options_en JSON NOT NULL,
    options_ta JSON NOT NULL,
    correct_answer_index TINYINT NOT NULL,
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') DEFAULT 'MEDIUM',
    marks INT DEFAULT 1,
    explanation_en TEXT,
    explanation_ta TEXT,
    active BOOLEAN DEFAULT TRUE
);`,
    },
    pom: {
      filename: 'pom.xml',
      lang: 'xml',
      content: `<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.4</version>
</parent>

<properties>
    <java.version>21</java.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-oauth2-client</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
    </dependency>
</dependencies>`,
    },
    yml: {
      filename: 'application.yml',
      lang: 'yaml',
      content: `spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: \${GOOGLE_CLIENT_ID}
            client-secret: \${GOOGLE_CLIENT_SECRET}
            scope: [openid, profile, email]
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
  datasource:
    url: jdbc:mysql://localhost:3306/quizmaster_db
    username: root
    password: \${MYSQL_PASSWORD}`,
    },
  };

  const currentFile = files[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Java 21 Spring Boot 3 Backend Blueprint</h2>
              <p className="text-xs text-slate-400">Production-ready Spring Security OAuth2 & MySQL persistence code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="bg-slate-800 px-4 pt-3 flex space-x-2 border-b border-slate-700 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'security' ? 'bg-slate-950 text-indigo-300 border-t-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> SecurityConfig.java
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`px-3 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'user' ? 'bg-slate-950 text-indigo-300 border-t-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> User.java (Entity)
          </button>
          <button
            onClick={() => setActiveTab('oauth')}
            className={`px-3 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'oauth' ? 'bg-slate-950 text-indigo-300 border-t-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> CustomOAuth2UserService.java
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'schema' ? 'bg-slate-950 text-indigo-300 border-t-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> schema.sql
          </button>
          <button
            onClick={() => setActiveTab('pom')}
            className={`px-3 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'pom' ? 'bg-slate-950 text-indigo-300 border-t-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> pom.xml
          </button>
          <button
            onClick={() => setActiveTab('yml')}
            className={`px-3 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'yml' ? 'bg-slate-950 text-indigo-300 border-t-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> application.yml
          </button>
        </div>

        {/* Code Content */}
        <div className="bg-slate-950 p-4 relative">
          <button
            onClick={handleCopy}
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono transition-colors border border-slate-700 shadow"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <pre className="text-slate-200 text-xs font-mono p-2 overflow-x-auto max-h-[55vh] leading-relaxed">
            <code>{currentFile.content}</code>
          </pre>
        </div>

        <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-400">
          <span>Files also saved in <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300 font-mono">/backend/</code> directory</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
