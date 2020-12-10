package com.showmaker.showmaker;

import com.showmaker.showmaker.show.Show;
import com.showmaker.showmaker.user.User;

public class TestUtil {

    public static User createValidUser() {
        User user = new User();
        user.setUsername("test-user");
        user.setDisplayName("test-display");
        user.setPassword("P4ssword");
        user.setImage("profile-image.png");
        return user;
    }

    public static User createValidUser(String username) {
        User user = createValidUser();
        user.setUsername(username);
        return user;
    }

    public static Show createValidShow() {
        Show show = new Show();
        show.setContent("test content for the test show");
        return show;
    }
}
