import axios from 'axios';
import * as apiCalls from './apiCalls';

describe('apiCalls', () => {
    describe('signup', () => {
        it('calls /api/1.0/users', () => {
            const mockSignup = jest.fn();
            axios.post = mockSignup;
            apiCalls.signup();

            const path = mockSignup.mock.calls[0][0];
            expect(path).toBe('/api/1.0/users');
        });
    });
    describe('login', () => {
        it('calls /api/1.0/login', () => {
            const mockLogin = jest.fn();
            axios.post = mockLogin;
            apiCalls.login({ username: 'test-user', password: 'P4ssword' });
            const path = mockLogin.mock.calls[0][0];
            expect(path).toBe('/api/1.0/login');
        });
    });
    describe('listUser', () => {
        it('calls /api/1.0/users?page=0&size=3 when no param provided for listUsers', () => {
            const mockListUsers = jest.fn();
            axios.get = mockListUsers;
            apiCalls.listUsers();
            expect(mockListUsers).toBeCalledWith('/api/1.0/users?page=0&size=3');
        });

        it('calls /api/1.0/users?page=5&size=10 when corresponding params provided for listUsers', () => {
            const mockListUsers = jest.fn();
            axios.get = mockListUsers;
            apiCalls.listUsers({ page: 5, size: 10 });
            expect(mockListUsers).toBeCalledWith('/api/1.0/users?page=5&size=10');
        });

        it('calls /api/1.0/users?page=5&size=3 when only page param provided for listUsers', () => {
            const mockListUsers = jest.fn();
            axios.get = mockListUsers;
            apiCalls.listUsers({ page: 5 });
            expect(mockListUsers).toBeCalledWith('/api/1.0/users?page=5&size=3');
        });

        it('calls /api/1.0/users?page=0&size=5 when only size param provided for listUsers', () => {
            const mockListUsers = jest.fn();
            axios.get = mockListUsers;
            apiCalls.listUsers({ size: 5 });
            expect(mockListUsers).toBeCalledWith('/api/1.0/users?page=0&size=5');
        });
    });
    describe('getUser', () => {
        it('calls /api/1.0/users/user5 when user5 is provided for getUser', () => {
            const mockGetUser = jest.fn();
            axios.get = mockGetUser;
            apiCalls.getUser('user5');
            expect(mockGetUser).toBeCalledWith('/api/1.0/users/user5');
        });
    });
    describe('updateUser', () => {
        it('calls /api/1.0/users/5 when 5 is provided for updateUser', () => {
            const mockUpdateUser = jest.fn();
            axios.put = mockUpdateUser;
            apiCalls.updateUser('5');

            const path = mockUpdateUser.mock.calls[0][0];
            expect(path).toBe('/api/1.0/users/5');
        });
    });
    describe('postShow', () => {
        it('calls /api/1.0/shows', () => {
            const mockPostShow = jest.fn();
            axios.post = mockPostShow;
            apiCalls.postShow();
            const path = mockPostShow.mock.calls[0][0];
            expect(path).toBe('/api/1.0/shows');
        });
    });
    describe('loadShows', () => {
        it('calls /api/1.0/shows?page=0&size=5&sort=id,desc when no params provided', () => {
            const mockGetShows = jest.fn();
            axios.get = mockGetShows;
            apiCalls.loadShows();
            expect(mockGetShows).toBeCalledWith(
                '/api/1.0/shows?page=0&size=5&sort=id,desc'
            );
        });

        it('calls /api/1.0/users/user1/shows?page=0&size=5&sort=id,desc when user params provided', () => {
            const mockGetShows = jest.fn();
            axios.get = mockGetShows;
            apiCalls.loadShows('user1');
            expect(mockGetShows).toBeCalledWith(
                '/api/1.0/users/user1/shows?page=0&size=5&sort=id,desc'
            );
        });
    });
    describe('loadOldShows', () => {
        it('calls /api/1.0/shows/5?direction=before&page=0&size=5&sort=id,desc when user params provided', () => {
            const mockGetShows = jest.fn();
            axios.get = mockGetShows;
            apiCalls.loadOldShows(5);
            expect(mockGetShows).toBeCalledWith(
                '/api/1.0/shows/5?direction=before&page=0&size=5&sort=id,desc'
            );
        });

        it('calls /api/1.0/users/user3/shows/5?direction=before&page=0&size=5&sort=id,desc when id and user params provided', () => {
            const mockGetShows = jest.fn();
            axios.get = mockGetShows;
            apiCalls.loadOldShows(5, 'user3');
            expect(mockGetShows).toBeCalledWith(
                '/api/1.0/users/user3/shows/5?direction=before&page=0&size=5&sort=id,desc'
            );
        });
    });
    describe('loadNewShows', () => {
        it('calls /api/1.0/shows/5?direction=after&sort=id,desc when user params provided', () => {
            const mockGetShows = jest.fn();
            axios.get = mockGetShows;
            apiCalls.loadNewShows(5);
            expect(mockGetShows).toBeCalledWith(
                '/api/1.0/shows/5?direction=after&sort=id,desc'
            );
        });

        it('calls /api/1.0/users/user3/shows/5?direction=after&sort=id,desc when id and user params provided', () => {
            const mockGetShows = jest.fn();
            axios.get = mockGetShows;
            apiCalls.loadNewShows(5, 'user3');
            expect(mockGetShows).toBeCalledWith(
                '/api/1.0/users/user3/shows/5?direction=after&sort=id,desc'
            );
        });
    });
    describe('loadNewShowsCount', () => {
        it('calls /api/1.0/shows/5?direction=after&count=true when user params provided', () => {
            const mockGetShows = jest.fn();
            axios.get = mockGetShows;
            apiCalls.loadNewShowsCount(5);
            expect(mockGetShows).toBeCalledWith(
                '/api/1.0/shows/5?direction=after&count=true'
            );
        });

        it('calls /api/1.0/users/user3/shows/5?direction=after&count=true when id and user params provided', () => {
            const mockGetShows = jest.fn();
            axios.get = mockGetShows;
            apiCalls.loadNewShowsCount(5, 'user3');
            expect(mockGetShows).toBeCalledWith(
                '/api/1.0/users/user3/shows/5?direction=after&count=true'
            );
        });
    });
    describe('postShowFile', () => {
        it('calls /api/1.0/shows/upload', () => {
            const mockPostShowFile = jest.fn();
            axios.post = mockPostShowFile;
            apiCalls.postShowFile();
            const path = mockPostShowFile.mock.calls[0][0];
            expect(path).toBe('/api/1.0/shows/upload');
        });
    });
    describe('deleteShow', () => {
        it('calls /api/1.0/shows/5 when show id param provided as 5', () => {
            const mockDelete = jest.fn();
            axios.delete = mockDelete;
            apiCalls.deleteShow(5);
            const path = mockDelete.mock.calls[0][0];
            expect(path).toBe('/api/1.0/shows/5');
        });
    })
});