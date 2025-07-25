package com.dhrishit.tournamate.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        // A more robust way to handle the service account key.
        // It first checks for an environment variable, which is standard for production.
        // If not found, it falls back to a local file path for easier development.
        String serviceAccountPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");

        if (!StringUtils.hasText(serviceAccountPath)) {
            serviceAccountPath = "serviceAccountKey.json";
        }

        FileInputStream serviceAccount = new FileInputStream(serviceAccountPath);

        FirebaseOptions options = new FirebaseOptions.Builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setDatabaseUrl("https://tournament-tracker-lite-default-rtdb.asia-southeast1.firebasedatabase.app/")
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.initializeApp(options);
        } else {
            return FirebaseApp.getInstance();
        }
    }
}
