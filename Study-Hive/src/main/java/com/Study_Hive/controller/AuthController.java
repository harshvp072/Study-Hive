package com.Study_Hive.controller;

import com.Study_Hive.dto.UserDto; // Import UserDto
import com.Study_Hive.model.User;
import com.Study_Hive.service.UserService;
import jakarta.servlet.http.HttpSession; // Added for storing user in session
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    // Helper method to convert User entity to UserDto
    private UserDto convertToUserDto(User user) {
        if (user == null) {
            return null;
        }
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setUsername(user.getUsername());
        return userDto;
    }

    @PostMapping("/register")
    public UserDto register(@RequestBody User user) { // Return UserDto
        User registeredUser = userService.register(user);
        return convertToUserDto(registeredUser); // Convert and return DTO
    }

    @PostMapping("/login")
    public UserDto login(@RequestBody User userRequest, HttpSession session) { // Return UserDto and inject HttpSession
        User loggedInUser = userService.login(userRequest.getEmail(), userRequest.getPassword());
        if (loggedInUser != null) {
            session.setAttribute("user", loggedInUser); // Store the full User object in session
            System.out.println("Login successful for " + loggedInUser.getEmail());
            return convertToUserDto(loggedInUser); // Convert and return DTO
        }
        System.out.println("Login failed for " + userRequest.getEmail());
        return null; // Or throw an exception for clearer error handling on the client
    }
}