package com.showmaker.showmaker.show;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ShowService {

    ShowRepository showRepository;

    public ShowService(ShowRepository showRepository) {
        super();
        this.showRepository = showRepository;
    }

    public void save(Show show) {
        show.setTimestamp(LocalDateTime.now());
        showRepository.save(show);
    }
}
