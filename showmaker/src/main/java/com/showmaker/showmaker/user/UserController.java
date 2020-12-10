package com.showmaker.showmaker.user;

import com.showmaker.showmaker.error.ApiError;
import com.showmaker.showmaker.shared.CurrentUser;
import com.showmaker.showmaker.shared.GenericResponse;
import com.showmaker.showmaker.user.dto.UserDTO;
import com.showmaker.showmaker.user.dto.UserUpdateDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/1.0")
public class UserController {

    @Autowired
    UserService userService;

    @PostMapping("/users")
    GenericResponse createUser(@Valid @RequestBody User user) {
        userService.save(user);
        return new GenericResponse("User saved.");
    }

    @GetMapping("/users")
    Page<UserDTO> getUsers( @CurrentUser User loggedInUser,
            /* @PageableDefault(size = 10) */ Pageable pageable) {
        return userService.getUsers(loggedInUser, pageable).map(UserDTO::new);
    }

    @GetMapping("/users/{username}")
    UserDTO getUserByName(@PathVariable String username) {
        User user = userService.getByUsername(username);
        return new UserDTO(user);
    }

    @PutMapping("/users/{id:[0-9]+}")
    @PreAuthorize("#id == principal.id")
    UserDTO updateUser(@PathVariable long id, @Valid @RequestBody(required = false) UserUpdateDTO userUpdateDto) {
        User updatedUser = userService.update(id, userUpdateDto);
        return new UserDTO(updatedUser);
    }

}
