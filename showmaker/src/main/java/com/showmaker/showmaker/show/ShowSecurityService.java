package com.showmaker.showmaker.show;

import com.showmaker.showmaker.user.User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ShowSecurityService {

    ShowRepository showRepository;

    public ShowSecurityService(ShowRepository showRepository) {
        super();
        this.showRepository = showRepository;
    }

    public boolean isAllowedToDelete(long showId, User loggedInUser) {
        Optional<Show> optionalShow = showRepository.findById(showId);
        if (optionalShow.isPresent()) {
            Show inDB = optionalShow.get();
            return inDB.getUser().getId() == loggedInUser.getId();
        }
        return false;
    }
}
