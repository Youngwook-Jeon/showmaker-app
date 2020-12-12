package com.showmaker.showmaker.show;

import com.showmaker.showmaker.user.User;
import com.showmaker.showmaker.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ShowService {

    ShowRepository showRepository;
    UserService userService;

    public ShowService(ShowRepository showRepository, UserService userService) {
        super();
        this.showRepository = showRepository;
        this.userService = userService;
    }

    public Show save(User user, Show show) {
        show.setTimestamp(LocalDateTime.now());
        show.setUser(user);
        return showRepository.save(show);
    }

    public Page<Show> getAllShows(Pageable pageable) {
        return showRepository.findAll(pageable);
    }

    public Page<Show> getShowsOfUser(String username, Pageable pageable) {
        User inDB = userService.getByUsername(username);
        return showRepository.findByUser(inDB, pageable);
    }
}
