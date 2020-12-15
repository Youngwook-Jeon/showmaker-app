package com.showmaker.showmaker.show;

import com.showmaker.showmaker.user.User;
import com.showmaker.showmaker.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.time.LocalDateTime;
import java.util.List;

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

    public Page<Show> getOldShows(long id, String username, Pageable pageable) {
        Specification<Show> spec = Specification.where(idLessThan(id));
        if (username != null) {
            User inDB = userService.getByUsername(username);
            spec = spec.and(userIs(inDB));
        }
        return showRepository.findAll(spec, pageable);
    }

    public List<Show> getNewShows(long id, String username, Pageable pageable) {
        Specification<Show> spec = Specification.where(idGreaterThan(id));
        if (username != null) {
            User inDB = userService.getByUsername(username);
            spec = spec.and(userIs(inDB));
        }
        return showRepository.findAll(spec, pageable.getSort());
    }

    public long getNewShowsCount(long id, String username) {
        Specification<Show> spec = Specification.where(idGreaterThan(id));
        if (username != null) {
            User inDB = userService.getByUsername(username);
            spec = spec.and(userIs(inDB));
        }
        return showRepository.count(spec);
    }

    private Specification<Show> userIs(User user) {
        return (Specification<Show>) (root, criteriaQuery, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("user"), user);
    }

    private Specification<Show> idLessThan(long id) {
        return (Specification<Show>) (root, criteriaQuery, criteriaBuilder) ->
                criteriaBuilder.lessThan(root.get("id"), id);
    }

    private Specification<Show> idGreaterThan(long id) {
        return (Specification<Show>) (root, criteriaQuery, criteriaBuilder) ->
                criteriaBuilder.greaterThan(root.get("id"), id);
    }
}
