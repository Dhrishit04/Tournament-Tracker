package com.dhrishit.tournamate.controller;

import com.dhrishit.tournamate.model.Player;
import com.dhrishit.tournamate.service.PlayerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;
    private static final Logger logger = LoggerFactory.getLogger(PlayerController.class);

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public ResponseEntity<?> getAllPlayers() {
        try {
            List<Player> players = playerService.getAllPlayers();
            return ResponseEntity.ok(players);
        } catch (ExecutionException | InterruptedException e) {
            logger.error("Error fetching all players: {}", e.getMessage());
            Thread.currentThread().interrupt();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching players from database.");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPlayerById(@PathVariable String id) {
        try {
            return playerService.getPlayerById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (ExecutionException | InterruptedException e) {
            logger.error("Error fetching player with id {}: {}", id, e.getMessage());
            Thread.currentThread().interrupt();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching player from database.");
        }
    }

    @PostMapping
    public ResponseEntity<?> addPlayer(@RequestBody Player player) {
        try {
            Player newPlayer = playerService.addPlayer(player);
            return ResponseEntity.status(HttpStatus.CREATED).body(newPlayer);
        } catch (ExecutionException | InterruptedException e) {
            logger.error("Error adding player: {}", e.getMessage());
            Thread.currentThread().interrupt();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error adding player to database.");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePlayer(@PathVariable String id, @RequestBody Player player) {
        try {
            return playerService.updatePlayer(id, player)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (ExecutionException | InterruptedException e) {
            logger.error("Error updating player with id {}: {}", id, e.getMessage());
            Thread.currentThread().interrupt();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating player in database.");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlayer(@PathVariable String id) {
        try {
            if (playerService.deletePlayer(id)) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (ExecutionException | InterruptedException e) {
            logger.error("Error deleting player with id {}: {}", id, e.getMessage());
            Thread.currentThread().interrupt();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting player from database.");
        }
    }
}
