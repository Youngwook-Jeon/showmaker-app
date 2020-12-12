package com.showmaker.showmaker.show;

import com.showmaker.showmaker.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShowRepository extends JpaRepository<Show, Long> {

    Page<Show> findByUser(User user, Pageable pageable);

}
