package com.showmaker.showmaker.user;

import com.fasterxml.jackson.annotation.JsonView;
import com.showmaker.showmaker.error.ApiError;
import com.showmaker.showmaker.shared.CurrentUser;
import com.showmaker.showmaker.user.dto.UserDTO;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
public class LoginController {

    @PostMapping("/api/1.0/login")
    UserDTO handleLogin(@CurrentUser User loggedInUser) {
        return new UserDTO(loggedInUser);
    }

}
