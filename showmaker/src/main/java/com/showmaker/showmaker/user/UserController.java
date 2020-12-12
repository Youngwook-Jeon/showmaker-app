package com.showmaker.showmaker.user;

import com.showmaker.showmaker.shared.CurrentUser;
import com.showmaker.showmaker.shared.GenericResponse;
import com.showmaker.showmaker.user.vm.UserVM;
import com.showmaker.showmaker.user.vm.UserUpdateVM;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

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
    Page<UserVM> getUsers(@CurrentUser User loggedInUser,
            /* @PageableDefault(size = 10) */ Pageable pageable) {
        return userService.getUsers(loggedInUser, pageable).map(UserVM::new);
    }

    @GetMapping("/users/{username}")
    UserVM getUserByName(@PathVariable String username) {
        User user = userService.getByUsername(username);
        return new UserVM(user);
    }

    @PutMapping("/users/{id:[0-9]+}")
    @PreAuthorize("#id == principal.id")
    UserVM updateUser(@PathVariable long id, @Valid @RequestBody(required = false) UserUpdateVM userUpdateVM) {
        User updatedUser = userService.update(id, userUpdateVM);
        return new UserVM(updatedUser);
    }

}
