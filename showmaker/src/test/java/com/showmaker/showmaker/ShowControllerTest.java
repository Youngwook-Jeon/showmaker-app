package com.showmaker.showmaker;

import com.showmaker.showmaker.error.ApiError;
import com.showmaker.showmaker.show.Show;
import com.showmaker.showmaker.show.ShowRepository;
import com.showmaker.showmaker.show.ShowService;
import com.showmaker.showmaker.show.vm.ShowVM;
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
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceUnit;
import java.util.List;
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

    @Autowired
    ShowService showService;

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

    @Test
    public void getShows_whenThereAreNoShows_receiveOk() {
        ResponseEntity<Object> response = getShows(new ParameterizedTypeReference<Object>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getShows_whenThereAreNoShows_receivePageWithZeroItems() {
        ResponseEntity<TestPage<Object>> response =
                getShows(new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(0);
    }

    @Test
    public void getShows_whenThereAreShows_receivePageWithItems() {
        User user = userService.save(TestUtil.createValidUser("user1"));
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());

        ResponseEntity<TestPage<Object>> response =
                getShows(new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(3);
    }

    @Test
    public void getShows_whenThereAreShows_receivePageWithShowVM() {
        User user = userService.save(TestUtil.createValidUser("user1"));
        showService.save(user, TestUtil.createValidShow());

        ResponseEntity<TestPage<ShowVM>> response =
                getShows(new ParameterizedTypeReference<TestPage<ShowVM>>() {});
        ShowVM storedShow = response.getBody().getContent().get(0);
        assertThat(storedShow.getUser().getUsername()).isEqualTo("user1");
    }

    @Test
    public void postShow_whenShowIsValidAndUserIsAuthorized_receiveShowVM() {
        userService.save(TestUtil.createValidUser("user1"));
        authenticate("user1");
        Show show = TestUtil.createValidShow();
        ResponseEntity<ShowVM> response = postShow(show, ShowVM.class);
        assertThat(response.getBody().getUser().getUsername()).isEqualTo("user1");
    }

    @Test
    public void getShowsOfUser_whenUserExists_receiveOk() {
        userService.save(TestUtil.createValidUser("user1"));
        ResponseEntity<Object> response =
                getShowsOfUser("user1", new ParameterizedTypeReference<Object>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getShowsOfUser_whenUserDoesNotExist_receiveNotFound() {
        ResponseEntity<Object> response =
                getShowsOfUser("unknownUser", new ParameterizedTypeReference<Object>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void getShowsOfUser_whenUserExists_receivePageWithZeroShows() {
        userService.save(TestUtil.createValidUser("user1"));
        ResponseEntity<TestPage<Object>> response =
                getShowsOfUser("user1", new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(0);
    }

    @Test
    public void getShowsOfUser_whenUserExistsWithShow_receivePageWithShowVM() {
        User user = userService.save(TestUtil.createValidUser("user1"));
        showService.save(user, TestUtil.createValidShow());

        ResponseEntity<TestPage<ShowVM>> response =
                getShowsOfUser("user1", new ParameterizedTypeReference<TestPage<ShowVM>>() {});
        ShowVM storedShow = response.getBody().getContent().get(0);
        assertThat(storedShow.getUser().getUsername()).isEqualTo("user1");
    }

    @Test
    public void getShowsOfUser_whenUserExistsWithMultipleShows_receivePageWithMatchingShowsCount() {
        User user = userService.save(TestUtil.createValidUser("user1"));
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());

        ResponseEntity<TestPage<ShowVM>> response =
                getShowsOfUser("user1", new ParameterizedTypeReference<TestPage<ShowVM>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(3);
    }

    @Test
    public void getShowsOfUser_whenMultipleUserExistsWithMultipleShows_receivePageWithMatchingShowsCount() {
        User userWithThreeShows = userService.save(TestUtil.createValidUser("user1"));
        IntStream.rangeClosed(1,3).forEach(i -> {
            showService.save(userWithThreeShows, TestUtil.createValidShow());
        });
        User userWithFiveShows = userService.save(TestUtil.createValidUser("user2"));
        IntStream.rangeClosed(1,5).forEach(i -> {
            showService.save(userWithFiveShows, TestUtil.createValidShow());
        });

        ResponseEntity<TestPage<ShowVM>> response =
                getShowsOfUser(userWithFiveShows.getUsername(), new ParameterizedTypeReference<TestPage<ShowVM>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(5);
    }

    @Test
    public void getOldShows_whenThereAreNoShows_receiveOk() {
        ResponseEntity<Object> response = getOldShows(5, new ParameterizedTypeReference<Object>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getOldShows_whenThereAreShows_receivePageWithItemsProvidedId() {
        User user = userService.save(TestUtil.createValidUser("user1"));
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        Show fourth = showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());

        ResponseEntity<TestPage<Object>> response =
                getOldShows(fourth.getId(), new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(3);
    }

    @Test
    public void getOldShows_whenThereAreShows_receivePageWithShowVMBeforeProvidedId() {
        User user = userService.save(TestUtil.createValidUser("user1"));
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        Show fourth = showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());

        ResponseEntity<TestPage<ShowVM>> response =
                getOldShows(fourth.getId(), new ParameterizedTypeReference<TestPage<ShowVM>>() {});
        assertThat(response.getBody().getContent().get(0).getDate()).isNotNull();
    }

    @Test
    public void getOldShowsOfUser_whenUserExistThereAreNoShows_receiveOk() {
        userService.save(TestUtil.createValidUser("user1"));
        ResponseEntity<Object> response = getOldShowsOfUser(5, "user1", new ParameterizedTypeReference<Object>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getOldShowsOfUser_whenUserExistAndThereAreShows_receivePageWithItemsProvidedId() {
        User user = userService.save(TestUtil.createValidUser("user1"));
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        Show fourth = showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());

        ResponseEntity<TestPage<ShowVM>> response =
                getOldShowsOfUser(fourth.getId(),"user1", new ParameterizedTypeReference<TestPage<ShowVM>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(3);
    }

    @Test
    public void getOldShowsOfUser_whenUserExistAndThereAreShows_receivePageWithShowVMBeforeProvidedId() {
        User user = userService.save(TestUtil.createValidUser("user1"));
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        Show fourth = showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());

        ResponseEntity<TestPage<ShowVM>> response =
                getOldShowsOfUser(fourth.getId(), "user1", new ParameterizedTypeReference<TestPage<ShowVM>>() {});
        assertThat(response.getBody().getContent().get(0).getDate()).isNotNull();
    }

    @Test
    public void getOldShowsOfUser_whenUserDoesNotExistThereAreNoShows_receiveNotFound() {
        ResponseEntity<Object> response = getOldShowsOfUser(5, "user1", new ParameterizedTypeReference<Object>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void getOldShowsOfUser_whenUserExistAndThereAreNoShows_receivePageWithZeroItemsBeforeProvidedId() {
        User user = userService.save(TestUtil.createValidUser("user1"));
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        Show fourth = showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());

        userService.save(TestUtil.createValidUser("user2"));

        ResponseEntity<TestPage<ShowVM>> response =
                getOldShowsOfUser(fourth.getId(), "user2", new ParameterizedTypeReference<TestPage<ShowVM>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(0);
    }

    @Test
    public void getNewShows_whenThereAreShows_receiveListOfItemsProvidedId() {
        User user = userService.save(TestUtil.createValidUser("user1"));
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        Show fourth = showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());

        ResponseEntity<List<Object>> response =
                getNewShows(fourth.getId(), new ParameterizedTypeReference<List<Object>>() {});
        assertThat(response.getBody().size()).isEqualTo(1);
    }

    @Test
    public void getNewShows_whenThereAreShows_receiveListOfShowVMProvidedId() {
        User user = userService.save(TestUtil.createValidUser("user1"));
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        Show fourth = showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());

        ResponseEntity<List<ShowVM>> response =
                getNewShows(fourth.getId(), new ParameterizedTypeReference<List<ShowVM>>() {});
        assertThat(response.getBody().get(0).getDate()).isNotNull();
    }

    @Test
    public void getNewShowsOfUser_whenUserExistThereAreNoShows_receiveOk() {
        userService.save(TestUtil.createValidUser("user1"));
        ResponseEntity<Object> response = getNewShowsOfUser(5, "user1", new ParameterizedTypeReference<Object>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getNewShowsOfUser_whenUserExistAndThereAreShows_receiveListWithItemsAfterProvidedId() {
        User user = userService.save(TestUtil.createValidUser("user1"));
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        Show fourth = showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());

        ResponseEntity<List<Object>> response =
                getNewShowsOfUser(fourth.getId(),"user1", new ParameterizedTypeReference<List<Object>>() {});
        assertThat(response.getBody().size()).isEqualTo(1);
    }

    @Test
    public void getNewShowsOfUser_whenUserExistAndThereAreShows_receiveListWithShowVMAfterProvidedId() {
        User user = userService.save(TestUtil.createValidUser("user1"));
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        Show fourth = showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());

        ResponseEntity<List<ShowVM>> response =
                getNewShowsOfUser(fourth.getId(), "user1", new ParameterizedTypeReference<List<ShowVM>>() {});
        assertThat(response.getBody().get(0).getDate()).isNotNull();
    }

    @Test
    public void getNewShowsOfUser_whenUserDoesNotExistThereAreNoShows_receiveNotFound() {
        ResponseEntity<Object> response = getNewShowsOfUser(5, "user1", new ParameterizedTypeReference<Object>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void getNewShowsOfUser_whenUserExistAndThereAreNoShows_receiveListWithZeroItemsAfterProvidedId() {
        User user = userService.save(TestUtil.createValidUser("user1"));
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        Show fourth = showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());

        userService.save(TestUtil.createValidUser("user2"));

        ResponseEntity<List<ShowVM>> response =
                getNewShowsOfUser(fourth.getId(), "user2", new ParameterizedTypeReference<List<ShowVM>>() {});
        assertThat(response.getBody().size()).isEqualTo(0);
    }

    @Test
    public void getNewShowCount_whenThereAreShows_receiveCountAfterProvidedId() {
        User user = userService.save(TestUtil.createValidUser("user1"));
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        Show fourth = showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());

        ResponseEntity<Map<String, Long>> response =
                getNewShowCount(fourth.getId(), new ParameterizedTypeReference<Map<String, Long>>() {});
        assertThat(response.getBody().get("count")).isEqualTo(1);
    }

    @Test
    public void getNewShowsCountOfUser_whenThereAreShows_receiveCountAfterProvidedId() {
        User user = userService.save(TestUtil.createValidUser("user1"));
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());
        Show fourth = showService.save(user, TestUtil.createValidShow());
        showService.save(user, TestUtil.createValidShow());

        ResponseEntity<Map<String, Long>> response =
                getNewShowsCountOfUser(fourth.getId(), "user1", new ParameterizedTypeReference<Map<String, Long>>() {});
        assertThat(response.getBody().get("count")).isEqualTo(1);
    }

    public <T> ResponseEntity<T> getNewShowCount(long showId, ParameterizedTypeReference<T> responseType) {
        String path = API_1_0_SHOWS + "/" + showId + "?direction=after&count=true";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    public <T> ResponseEntity<T> getNewShowsCountOfUser(long showId, String username, ParameterizedTypeReference<T> responseType) {
        String path = "/api/1.0/users/" + username + "/shows/" + showId +
                "?direction=after&count=true";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    public <T> ResponseEntity<T> getNewShows(long showId, ParameterizedTypeReference<T> responseType) {
        String path = API_1_0_SHOWS + "/" + showId + "?direction=after&sort=id,desc";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    public <T> ResponseEntity<T> getNewShowsOfUser(long showId, String username, ParameterizedTypeReference<T> responseType) {
        String path = "/api/1.0/users/" + username + "/shows/" + showId +
                "?direction=after&sort=id,desc";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    public <T> ResponseEntity<T> getOldShows(long showId, ParameterizedTypeReference<T> responseType) {
        String path = API_1_0_SHOWS + "/" + showId + "?direction=before&page=0&size=5&sort=id,desc";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    public <T> ResponseEntity<T> getOldShowsOfUser(long showId, String username, ParameterizedTypeReference<T> responseType) {
        String path = "/api/1.0/users/" + username + "/shows/" + showId +
                "?direction=before&page=0&size=5&sort=id,desc";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    public <T> ResponseEntity<T> getShowsOfUser(String username, ParameterizedTypeReference<T> responseType) {
        String path = "/api/1.0/users/" + username + "/shows";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    public <T> ResponseEntity<T> getShows(ParameterizedTypeReference<T> responseType) {
        return testRestTemplate.exchange(API_1_0_SHOWS, HttpMethod.GET, null, responseType);
    }

    private <T> ResponseEntity<T> postShow(Show show, Class<T> responseType) {
        return testRestTemplate.postForEntity(API_1_0_SHOWS, show, responseType);
    }

    private void authenticate(String username) {
        testRestTemplate.getRestTemplate().getInterceptors()
                .add(new BasicAuthenticationInterceptor(username, "P4ssword"));
    }
}
