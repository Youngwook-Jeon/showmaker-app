package com.showmaker.showmaker.show;

import com.showmaker.showmaker.shared.CurrentUser;
import com.showmaker.showmaker.show.vm.ShowVM;
import com.showmaker.showmaker.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/1.0")
public class ShowController {

    @Autowired
    ShowService showService;

    @PostMapping("/shows")
    ShowVM createShow(@Valid @RequestBody Show show, @CurrentUser User user) {
        return new ShowVM(showService.save(user, show));
    }

    @GetMapping("/shows")
    Page<ShowVM> getAllShows(Pageable pageable) {
        return showService.getAllShows(pageable).map(ShowVM::new);
    }

    @GetMapping("/users/{username}/shows")
    Page<ShowVM> getShowsOfUser(@PathVariable String username, Pageable pageable) {
        return showService.getShowsOfUser(username, pageable).map(ShowVM::new);
    }

    @GetMapping({"/shows/{id:[0-9]+}", "/users/{username}/shows/{id:[0-9]+}"})
    ResponseEntity<?> getShowsRelative(@PathVariable long id,
                                       @PathVariable(required = false) String username,
                                       Pageable pageable,
                                       @RequestParam(name = "direction",
                                               defaultValue = "after") String direction,
                                       @RequestParam(name = "count",
                                               defaultValue = "false",
                                               required = false) boolean count) {
        if (!direction.equalsIgnoreCase("after")) {
            return ResponseEntity.ok(showService.getOldShows(id, username, pageable).map(ShowVM::new));
        }
        if (count) {
            long newShowCount = showService.getNewShowsCount(id, username);
            return ResponseEntity.ok(Collections.singletonMap("count", newShowCount));
        }
        List<ShowVM> newShows = showService.getNewShows(id, username, pageable).stream()
                .map(ShowVM::new).collect(Collectors.toList());
        return ResponseEntity.ok(newShows);
    }

}
