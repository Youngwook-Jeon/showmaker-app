package com.showmaker.showmaker.show;

import com.showmaker.showmaker.shared.CurrentUser;
import com.showmaker.showmaker.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/1.0")
public class ShowController {

    @Autowired
    ShowService showService;

    @PostMapping("/shows")
    void createShow(@Valid @RequestBody Show show, @CurrentUser User user) {
        showService.save(user, show);
    }
}
