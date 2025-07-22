package com.dhrishit.tournamate.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api") // All routes in this controller will be prefixed with /api
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> healthCheck() {
        // Returning a simple JSON object to confirm the API is up and running
        return Collections.singletonMap("status", "UP");
    }
}
