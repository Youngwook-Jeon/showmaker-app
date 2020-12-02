package com.showmaker.showmaker.user;

import com.showmaker.showmaker.error.NotFoundException;
import com.showmaker.showmaker.user.dto.UserUpdateDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {

    UserRepository userRepository;
    PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        super();
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User save(User user) {
        // check if we have user in DB with this username
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Page<User> getUsers(User loggedInUser, Pageable pageable) {
        if (loggedInUser != null) {
            return userRepository.findByUsernameNot(loggedInUser.getUsername(), pageable);
        }
        return userRepository.findAll(pageable);
    }

    public User getByUsername(String username) {
        User inDB = userRepository.findByUsername(username);
        if (inDB == null) {
            throw new NotFoundException(username + " not found");
        }
        return inDB;
    }

    public User update(long id, UserUpdateDTO userUpdateDto) {
        User inDB = userRepository.getOne(id);
        inDB.setDisplayName(userUpdateDto.getDisplayName());
        String savedImageName = inDB.getUsername() + UUID.randomUUID().toString().replaceAll("-", "");
        inDB.setImage(savedImageName);
        return userRepository.save(inDB);
    }
}
