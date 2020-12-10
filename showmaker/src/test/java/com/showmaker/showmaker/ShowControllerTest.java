package com.showmaker.showmaker;

import com.showmaker.showmaker.error.ApiError;
import com.showmaker.showmaker.show.Show;
import com.showmaker.showmaker.show.ShowRepository;
import com.showmaker.showmaker.user.User;
import com.showmaker.showmaker.user.UserRepository;
import com.showmaker.showmaker.user.UserService;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceUnit;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class ShowControllerTest {

    private static final String API_1_0_SHOWS = "/api/1.0/shows";

    @Autowired
    TestRestTemplate testRestTemplate;

    @Autowired
    UserService userService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ShowRepository showRepository;

    @PersistenceUnit
    private EntityManagerFactory entityManagerFactory;

    @Before
    public void cleanup() {
        showRepository.deleteAll();
        userRepository.deleteAll();
        testRestTemplate.getRestTemplate().getInterceptors().clear();
    }

    @After
    public void cleanupAfter() {
        showRepository.deleteAll();
    }

    @Test
    public void postShow_whenShowIsValidAndUserIsAuthorized_receiveOk() {
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");
        Show show = TestUtil.createValidShow();
        ResponseEntity<Object> response = postShow(show, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void postShow_whenShowIsValidAndUserIsUnauthorized_receiveUnauthorized() {
        Show show = TestUtil.createValidShow();
        ResponseEntity<Object> response = postShow(show, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void postShow_whenShowIsValidAndUserIsUnauthorized_receiveApiError() {
        Show show = TestUtil.createValidShow();
        ResponseEntity<ApiError> response = postShow(show, ApiError.class);
        assertThat(response.getBody().getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
    }

    @Test
    public void postShow_whenShowIsValidAndUserIsAuthorized_showSavedToDatabase() {
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");
        Show show = TestUtil.createValidShow();
        postShow(show, Object.class);

        assertThat(showRepository.count()).isEqualTo(1);
    }

    @Test
    public void postShow_whenShowIsValidAndUserIsAuthorized_showSavedToDatabaseWithTimestamp() {
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");
        Show show = TestUtil.createValidShow();
        postShow(show, Object.class);

        Show inDB = showRepository.findAll().get(0);

        assertThat(inDB.getTimestamp()).isNotNull();
    }

    @Test
    public void postShow_whenShowContentIsNullAndUserIsAuthorized_receiveBadRequest() {
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");
        Show show = new Show();
        ResponseEntity<Object> response = postShow(show, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postShow_whenShowContentHasLessThan10CharsAndUserIsAuthorized_receiveBadRequest() {
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");
        Show show = new Show();
        show.setContent("123456789");
        ResponseEntity<Object> response = postShow(show, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postShow_whenShowContentHas5000CharsAndUserIsAuthorized_receiveOk() {
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");
        Show show = new Show();
        String veryLongString =
                IntStream.rangeClosed(1, 5000).mapToObj(i -> "x").collect(Collectors.joining());
        show.setContent(veryLongString);
        ResponseEntity<Object> response = postShow(show, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void postShow_whenShowContentHasMoreThan5000CharsAndUserIsAuthorized_receiveBadRequest() {
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");
        Show show = new Show();
        String veryLongString =
                IntStream.rangeClosed(1, 5001).mapToObj(i -> "x").collect(Collectors.joining());
        show.setContent(veryLongString);
        ResponseEntity<Object> response = postShow(show, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postShow_whenShowContentIsNullAndUserIsAuthorized_receiveApiErrorWithValidationErrors() {
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");
        Show show = new Show();
        ResponseEntity<ApiError> response = postShow(show, ApiError.class);
        Map<String, String> validationErrors = response.getBody().getValidationErrors();
        assertThat(validationErrors.get("content")).isNotNull();
    }

    @Test
    public void postShow_whenShowIsValidAndUserIsAuthorized_showSavedWithAuthenticatedUser() {
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");
        Show show = TestUtil.createValidShow();
        postShow(show, Object.class);

        Show inDB = showRepository.findAll().get(0);

        assertThat(inDB.getUser().getUsername()).isEqualTo("user1");
    }

    @Test
    public void postShow_whenShowIsValidAndUserIsAuthorized_showCanBeAccessedFromUserEntity() {
        User user = userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");
        Show show = TestUtil.createValidShow();
        postShow(show, Object.class);

        EntityManager entityManager = entityManagerFactory.createEntityManager();

        User inDBUser = entityManager.find(User.class, user.getId());
        assertThat(inDBUser.getShows().size()).isEqualTo(1);
    }

    private <T> ResponseEntity<T> postShow(Show show, Class<T> responseType) {
        return testRestTemplate.postForEntity(API_1_0_SHOWS, show, responseType);
    }

    private void authenticate(String username) {
        testRestTemplate.getRestTemplate().getInterceptors()
                .add(new BasicAuthenticationInterceptor(username, "P4ssword"));
    }
}
