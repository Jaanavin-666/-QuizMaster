package com.quizmaster.service;

import com.quizmaster.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Value("${quizmaster.admin-emails:}")
    private List<String> adminEmails;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String googleSub = (String) attributes.get("sub");
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");
        Boolean emailVerified = (Boolean) attributes.get("email_verified");

        if (googleSub == null || email == null) {
            throw new OAuth2AuthenticationException("Google identity response missing required sub/email claims");
        }

        // Determine user role based on designated admin list
        boolean isAdmin = adminEmails != null && adminEmails.stream()
                .anyMatch(admin -> admin.equalsIgnoreCase(email));

        String authorityRole = isAdmin ? "ROLE_ADMIN" : "ROLE_STUDENT";
        Set<SimpleGrantedAuthority> authorities = Collections.singleton(new SimpleGrantedAuthority(authorityRole));

        // Create enriched attributes
        Map<String, Object> enrichedAttributes = new HashMap<>(attributes);
        enrichedAttributes.put("role", isAdmin ? "ADMIN" : "STUDENT");
        enrichedAttributes.put("lastLogin", LocalDateTime.now().toString());

        return new DefaultOAuth2User(authorities, enrichedAttributes, "sub");
    }
}
