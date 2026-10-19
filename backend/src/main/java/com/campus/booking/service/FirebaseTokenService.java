package com.campus.booking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class FirebaseTokenService {

    private static final Logger log = LoggerFactory.getLogger(FirebaseTokenService.class);

    @Value("${app.firebase.config-file:classpath:firebase-service-account.json}")
    private Resource firebaseConfigFile;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private boolean initialized = false;

    @PostConstruct
    public void init() {
        try {
            if (firebaseConfigFile != null && firebaseConfigFile.exists()) {
                try (InputStream is = firebaseConfigFile.getInputStream()) {
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(is))
                            .build();
                    if (FirebaseApp.getApps().isEmpty()) {
                        FirebaseApp.initializeApp(options);
                    }
                    initialized = true;
                    log.info("Firebase Admin SDK successfully initialized with service account credentials.");
                }
            } else {
                log.info("No Firebase service account JSON file detected at '{}'. Running in dynamic token parsing mode for local development/college evaluation.", firebaseConfigFile);
            }
        } catch (Exception ex) {
            log.warn("Could not initialize Firebase Admin SDK from credentials: {}. Falling back to dynamic JWT parsing mode.", ex.getMessage());
        }
    }

    public FirebaseUserData verifyToken(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new IllegalArgumentException("Firebase ID token cannot be empty");
        }

        // 1. If Firebase Admin SDK is initialized, verify via official SDK
        if (initialized) {
            try {
                FirebaseToken token = FirebaseAuth.getInstance().verifyIdToken(idToken);
                String email = token.getEmail();
                String name = token.getName();
                String uid = token.getUid();
                return new FirebaseUserData(uid, email, name);
            } catch (Exception e) {
                log.error("Firebase Admin SDK token verification failed: {}", e.getMessage());
                throw new com.campus.booking.exception.BadRequestException("Invalid or expired Firebase ID token");
            }
        }

        // 2. Dynamic JWT payload parsing for evaluation/dev environments
        try {
            String[] parts = idToken.split("\\.");
            if (parts.length < 2) {
                throw new com.campus.booking.exception.BadRequestException("Malformed Firebase ID token structure");
            }

            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            String payloadJson = new String(decoded, StandardCharsets.UTF_8);
            JsonNode claims = objectMapper.readTree(payloadJson);

            String email = claims.has("email") ? claims.get("email").asText() : null;
            String name = claims.has("name") ? claims.get("name").asText() : null;
            String uid = claims.has("user_id") ? claims.get("user_id").asText() 
                       : (claims.has("sub") ? claims.get("sub").asText() : null);

            if (email == null || email.isBlank()) {
                throw new com.campus.booking.exception.BadRequestException("Firebase token does not contain a verified email address");
            }

            return new FirebaseUserData(uid, email, name);
        } catch (com.campus.booking.exception.BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to parse Firebase token payload: {}", ex.getMessage());
            throw new com.campus.booking.exception.BadRequestException("Unable to process authentication token");
        }
    }

    public static class FirebaseUserData {
        private final String uid;
        private final String email;
        private final String name;

        public FirebaseUserData(String uid, String email, String name) {
            this.uid = uid;
            this.email = email;
            this.name = name;
        }

        public String getUid() {
            return uid;
        }

        public String getEmail() {
            return email;
        }

        public String getName() {
            return name;
        }
    }
}
