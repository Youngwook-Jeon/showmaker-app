package com.showmaker.showmaker.show;

import com.showmaker.showmaker.shared.CurrentUser;
import com.showmaker.showmaker.show.vm.ShowVM;
import com.showmaker.showmaker.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

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
}
