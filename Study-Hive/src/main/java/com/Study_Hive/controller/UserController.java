package com.Study_Hive.controller;

import com.Study_Hive.model.User;
import com.Study_Hive.repo.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/")
    public String home(HttpSession session) {
        if (session.getAttribute("user") != null) {
            return "redirect:/index.html";
        }
        return "redirect:/home.html";
    }

    // Registration
    @PostMapping("/register")
    public String register(@RequestParam String username,
                           @RequestParam String email,
                           @RequestParam String password) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password); // In production, always hash the password!

        userRepository.save(user);
        return "redirect:/login.html";
    }

    // Login
    @PostMapping("/login")
    public String login(@RequestParam String email,
                        @RequestParam String password,
                        HttpSession session) {
        User user = userRepository.findByEmailAndPassword(email, password);
        if (user != null) {
            session.setAttribute("user", user);
            return "redirect:/index.html"; // Goes to session creation page
        } else {
            return "redirect:/login.html?error=true";
        }
    }

    @GetMapping("/check-session")
    @ResponseBody
    public boolean checkSession(HttpSession session) {
        return session.getAttribute("user") != null;
    }



    @PostMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/home.html";
    }

}