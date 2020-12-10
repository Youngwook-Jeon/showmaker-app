package com.showmaker.showmaker.show;

import com.showmaker.showmaker.user.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ShowService {

    ShowRepository showRepository;

    public ShowService(ShowRepository showRepository) {
        super();
        this.showRepository = showRepository;
    }

    public void save(User user, Show show) {
        show.setTimestamp(LocalDateTime.now());
        show.setUser(user);
        showRepository.save(show);
    }
}
