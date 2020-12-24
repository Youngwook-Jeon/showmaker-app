import React from 'react';
import { fireEvent, render, waitForDomChange, waitForElement } from '@testing-library/react';
import ShowFeed from './ShowFeed';
import * as apiCalls from '../api/apiCalls';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import authReducer from '../redux/authReducer';

const loggedInStateUser1 = {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png',
    password: 'P4ssword',
    isLoggedIn: true
};

const originalSetInterval = window.setInterval;
const originalClearInterval = window.clearInterval;

let timedFunction;

const useFakeIntervals = () => {
    window.setInterval = (callback, interval) => {
        if (!callback.toString().startsWith('function')) {
            timedFunction = callback;
            return 111111;
        }
    };
    window.clearInterval = (id) => {
        if (id === 111111) {
            timedFunction = undefined;
        }
    };
};

const useRealIntervals = () => {
    window.setInterval = originalSetInterval;
    window.clearInterval = originalClearInterval;
};

const runTimer = () => {
    timedFunction && timedFunction();
}
const setup = (props, state = loggedInStateUser1) => {
    const store = createStore(authReducer, state);

    return render(
        <Provider store={store}>
            <MemoryRouter>
                <ShowFeed {...props} />
            </MemoryRouter>
        </Provider>
    );
};

const mockEmptyResponse = {
    data: {
        content: []
    }
};

const mockSuccessGetNewShowsList = {
    data: [
        {
            id: 21,
            content: 'This is the new latest show',
            date: '12/15/2020',
            user: {
                id: 1,
                username: 'user1',
                displayName: 'display1',
                image: 'profile1.png'
            }
        }
    ]
};

const mockSuccessGetShowsMiddleOfMultiPage = {
    data: {
        content: [
            {
                id: 5,
                content: 'This is the middle show',
                date: '12/15/2020',
                user: {
                    id: 1,
                    username: 'user1',
                    displayName: 'display1',
                    image: 'profile1.png'
                }
            }
        ],
        number: 0,
        first: false,
        last: false,
        size: 5,
        totalPages: 1
    }
}

const mockSuccessGetShowsSinglePage = {
    data: {
        content: [
            {
                id: 10,
                content: 'This is the latest show',
                date: '12/15/2020',
                user: {
                    id: 1,
                    username: 'user1',
                    displayName: 'display1',
                    image: 'profile1.png'
                }
            }
        ],
        number: 0,
        first: true,
        last: true,
        size: 5,
        totalPages: 1
    }
};

const mockSuccessGetShowsFirstOfMultiPage = {
    data: {
        content: [
            {
                id: 10,
                content: 'This is the latest show',
                date: '12/15/2020',
                user: {
                    id: 1,
                    username: 'user1',
                    displayName: 'display1',
                    image: 'profile1.png'
                }
            },
            {
                id: 9,
                content: 'This is show9',
                date: '12/15/2020',
                user: {
                    id: 1,
                    username: 'user1',
                    displayName: 'display1',
                    image: 'profile1.png'
                }
            }
        ],
        number: 0,
        first: true,
        last: false,
        size: 5,
        totalPages: 2
    }
};

const mockSuccessGetShowsLastOfMultiPage = {
    data: {
        content: [
            {
                id: 1,
                content: 'This is the oldest show',
                date: '12/15/2020',
                user: {
                    id: 1,
                    username: 'user1',
                    displayName: 'display1',
                    image: 'profile1.png'
                }
            }
        ],
        number: 0,
        first: true,
        last: true,
        size: 5,
        totalPages: 2
    }
};

describe('ShowFeed', () => {
    describe('Lifecycle', () => {
        it('calls loadShows when it is rendered', () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockEmptyResponse);
            setup();
            expect(apiCalls.loadShows).toHaveBeenCalled();
        });

        it('calls loadShows with user parameter when it is rendered with user property', () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockEmptyResponse);
            setup({ user: 'user1' });
            expect(apiCalls.loadShows).toHaveBeenCalledWith('user1');
        });

        it('calls loadShows without user parameter when it is rendered without user property', () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockEmptyResponse);
            setup();
            const parameter = apiCalls.loadShows.mock.calls[0][0];
            expect(parameter).toBeUndefined();
        });

        it('calls loadNewShowCount with topShow id', async () => {
            useFakeIntervals();
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            const { queryByText } = setup();
            await waitForDomChange();
            runTimer();
            await waitForElement(() => queryByText('There is 1 new show'));
            const firstParam = apiCalls.loadNewShowsCount.mock.calls[0][0];
            expect(firstParam).toBe(10);
            useRealIntervals();
        });

        it('calls loadNewShows with topShow id and username when rendered with user property', async () => {
            useFakeIntervals();
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            const { queryByText } = setup({ user: 'user1' });
            await waitForDomChange();
            runTimer();
            await waitForElement(() => queryByText('There is 1 new show'));
            expect(apiCalls.loadNewShowsCount).toHaveBeenCalledWith(10, 'user1');
            useRealIntervals();
        });

        it('displays new show count as 1 after loadNewShowsCount success', async () => {
            useFakeIntervals();
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            const { queryByText } = setup({ user: 'user1' });
            await waitForDomChange();
            runTimer();
            const newShowCount = await waitForElement(() => queryByText('There is 1 new show'));
            expect(newShowCount).toBeInTheDocument();
            useRealIntervals();
        });

        it('displays new show count constantly', async () => {
            useFakeIntervals();
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            const { queryByText } = setup({ user: 'user1' });
            await waitForDomChange();
            runTimer();
            await waitForElement(() => queryByText('There is 1 new show'));
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 2 }});
            runTimer();
            const newShowCount = await waitForElement(() => queryByText('There are 2 new shows'));
            expect(newShowCount).toBeInTheDocument();
            useRealIntervals();
        });

        it('does not call loadNewShowCount after component is unmounted', async () => {
            useFakeIntervals();
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            const { queryByText, unmount } = setup({ user: 'user1' });
            await waitForDomChange();
            runTimer();
            await waitForElement(() => queryByText('There is 1 new show'));
            unmount();
            expect(apiCalls.loadNewShowsCount).toHaveBeenCalledTimes(1);
            useRealIntervals();
        });

        it('displays new show count as 1 after loadNewShowsCount success when user does not have shows initially', async () => {
            useFakeIntervals();
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockEmptyResponse);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            const { queryByText } = setup({ user: 'user1' });
            await waitForDomChange();
            runTimer();
            const newShowCount = await waitForElement(() => queryByText('There is 1 new show'));
            expect(newShowCount).toBeInTheDocument();
            useRealIntervals();
        });
    });
    describe('Layout', () => {
        it('displays no show message when the response has empty page', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockEmptyResponse);
            const { queryByText } = setup();
            const message = await waitForElement(() => queryByText('There are no shows'));
            expect(message).toBeInTheDocument();
        });

        it('does not display no show message when the response has page of show', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsSinglePage);
            const { queryByText } = setup();
            await waitForDomChange();
            expect(queryByText('There are no shows')).not.toBeInTheDocument();
        });
        
        it('displays spinner when loading the shows', async () => {
            apiCalls.loadShows = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(mockSuccessGetShowsSinglePage);
                    }, 300);
                });
            });
            const { queryByText } = setup();
            expect(queryByText('Loading...')).toBeInTheDocument();
        });

        it('displays show content', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsSinglePage);
            const { queryByText } = setup();
            const showContent = await waitForElement(() => queryByText('This is the latest show'));
            expect(showContent).toBeInTheDocument();
        });

        it('displays Load More when there are next pages', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            expect(loadMore).toBeInTheDocument();
        });
    });
    describe('Interactions', () => {
        it('calls loadOldShows with show id when clicking Load More', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadOldShows = jest.fn().mockResolvedValue(mockSuccessGetShowsLastOfMultiPage);
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            const firstParam = apiCalls.loadOldShows.mock.calls[0][0];
            expect(firstParam).toBe(9);
        });

        it('calls loadOldShows with show id and username when clicking Load More when rendered with user property', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadOldShows = jest.fn().mockResolvedValue(mockSuccessGetShowsLastOfMultiPage);
            const { queryByText } = setup({ user: 'user1' });
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            expect(apiCalls.loadOldShows).toHaveBeenCalledWith(9, 'user1');
        });

        it('displays loaded old shows when loadOldShows api call success', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadOldShows = jest.fn().mockResolvedValue(mockSuccessGetShowsLastOfMultiPage);
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            const oldShow = await waitForElement(() => queryByText('This is the oldest show'));
            expect(oldShow).toBeInTheDocument();
        });

        it('hides Load More when loadOldShows api call returns last page', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadOldShows = jest.fn().mockResolvedValue(mockSuccessGetShowsLastOfMultiPage);
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            await waitForElement(() => queryByText('This is the oldest show'));
            expect(queryByText('Load More')).not.toBeInTheDocument();
        });

        it('calls loadNewShows with show id when clicking New Show Count Card', async () => {
            useFakeIntervals();
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            apiCalls.loadNewShows = jest.fn().mockResolvedValue(mockSuccessGetNewShowsList);
            const { queryByText } = setup();
            await waitForDomChange();
            runTimer();
            const newShowsCount = await waitForElement(() => queryByText('There is 1 new show'));
            fireEvent.click(newShowsCount);
            const firstParam = apiCalls.loadNewShows.mock.calls[0][0];
            expect(firstParam).toBe(10);
            useRealIntervals();
        });

        it('calls loadNewShows with show id and username when clicking Load More when clicking New Show Count card', async () => {
            useFakeIntervals();
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            apiCalls.loadNewShows = jest.fn().mockResolvedValue(mockSuccessGetNewShowsList);
            const { queryByText } = setup({ user: 'user1' });
            await waitForDomChange();
            runTimer();
            const newShowsCount = await waitForElement(() => queryByText('There is 1 new show'));
            fireEvent.click(newShowsCount);
            expect(apiCalls.loadNewShows).toHaveBeenCalledWith(10, 'user1');
            useRealIntervals();
        });

        it('displays loaded new shows when loadNewShows api call success', async () => {
            useFakeIntervals();
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            apiCalls.loadNewShows = jest.fn().mockResolvedValue(mockSuccessGetNewShowsList);
            const { queryByText } = setup({ user: 'user1' });
            await waitForDomChange();
            runTimer();
            const newShowsCount = await waitForElement(() => queryByText('There is 1 new show'));
            fireEvent.click(newShowsCount);
            const newShow = await waitForElement(() => queryByText('This is the new latest show'));
            expect(newShow).toBeInTheDocument();
            useRealIntervals();
        });

        it('hides new show count when loadNewShows api call success', async () => {
            useFakeIntervals();
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            apiCalls.loadNewShows = jest.fn().mockResolvedValue(mockSuccessGetNewShowsList);
            const { queryByText } = setup({ user: 'user1' });
            await waitForDomChange();
            runTimer();
            const newShowsCount = await waitForElement(() => queryByText('There is 1 new show'));
            fireEvent.click(newShowsCount);
            await waitForElement(() => queryByText('This is the new latest show'));
            expect(queryByText('There is 1 new show')).not.toBeInTheDocument();
            useRealIntervals();
        });

        it('does not allow loadOldShows to be called when there is an active api call about it', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadOldShows = jest.fn().mockResolvedValue(mockSuccessGetShowsLastOfMultiPage);
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            await waitForDomChange();
            fireEvent.click(loadMore);
            expect(apiCalls.loadOldShows).toHaveBeenCalledTimes(1);
        });

        it('replaces Load More with spinner when there is an active api call about it', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadOldShows = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(mockSuccessGetShowsLastOfMultiPage);
                    }, 300);
                });
            });
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            const spinner = await waitForElement(() => queryByText('Loading...'));
            expect(spinner).toBeInTheDocument();
            expect(queryByText('Load More')).not.toBeInTheDocument();
        });

        it('replaces spinner with Load More after active api call for loadOldShows finishes with middle page response', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadOldShows = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(mockSuccessGetShowsMiddleOfMultiPage);
                    }, 300);
                });
            });
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            await waitForElement(() => queryByText('This is the middle show'));
            expect(queryByText('Loading...')).not.toBeInTheDocument();
            expect(queryByText('Load More')).toBeInTheDocument();
        });

        it('replaces spinner with Load More after active api call for loadOldShows finishes with error', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadOldShows = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject({ response: { data: {} }});
                    }, 300);
                });
            });
            const { queryByText } = setup();
            const loadMore = await waitForElement(() => queryByText('Load More'));
            fireEvent.click(loadMore);
            await waitForElement(() => queryByText('Loading...'));
            await waitForDomChange();
            expect(queryByText('Loading...')).not.toBeInTheDocument();
            expect(queryByText('Load More')).toBeInTheDocument();
        });

        it('does not allow loadNewShows to be called when there is an active api call about it', async () => {
            useFakeIntervals();
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            apiCalls.loadNewShows = jest.fn().mockResolvedValue(mockSuccessGetNewShowsList);
            const { queryByText } = setup({ user: 'user1' });
            await waitForDomChange();
            runTimer();
            const newShowsCount = await waitForElement(() => queryByText('There is 1 new show'));
            fireEvent.click(newShowsCount);
            await waitForDomChange();
            fireEvent.click(newShowsCount);
            expect(apiCalls.loadNewShows).toHaveBeenCalledTimes(1);
            useRealIntervals();
        });

        it('replaces There is 1 new show with spinner when there is an active api call about it', async () => {
            useFakeIntervals();
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            apiCalls.loadNewShows = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(mockSuccessGetNewShowsList);
                    }, 300);
                });
            });
            const { queryByText } = setup();
            await waitForDomChange();
            runTimer();
            const newShowsCount = await waitForElement(() => queryByText('There is 1 new show'));
            fireEvent.click(newShowsCount);
            const spinner = await waitForElement(() => queryByText('Loading...'));
            expect(spinner).toBeInTheDocument();
            expect(queryByText('There is 1 new show')).not.toBeInTheDocument();
            useRealIntervals();
        });

        it('removes spinner and There is 1 new show after active api call for loadNewShows finishes with success', async () => {
            useFakeIntervals();
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            apiCalls.loadNewShows = jest.fn().mockResolvedValue(mockSuccessGetNewShowsList);
            const { queryByText } = setup({ user: 'user1' });
            await waitForDomChange();
            runTimer();
            const newShowsCount = await waitForElement(() => queryByText('There is 1 new show'));
            fireEvent.click(newShowsCount);
            await waitForElement(() => queryByText('This is the new latest show'));
            expect(queryByText('Loading...')).not.toBeInTheDocument();
            expect(queryByText('There is 1 new show')).not.toBeInTheDocument();
            useRealIntervals();
        });

        it('replaces spinner with There is 1 new show after active api call for loadNewShows finishes with error', async () => {
            useFakeIntervals();
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            apiCalls.loadNewShows = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject({ response: { data: {} }});
                    }, 300);
                });
            });
            const { queryByText } = setup();
            await waitForDomChange();
            runTimer();
            const newShowsCount = await waitForElement(() => queryByText('There is 1 new show'));
            fireEvent.click(newShowsCount);
            await waitForElement(() => queryByText('Loading...'));
            await waitForDomChange();
            expect(queryByText('Loading...')).not.toBeInTheDocument();
            expect(queryByText('There is 1 new show')).toBeInTheDocument();
            useRealIntervals();
        });

        it('displays modal when clicking delete on show', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            const { queryByTestId, container } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);

            const modalRootDiv = queryByTestId('modal-root');
            expect(modalRootDiv).toHaveClass('modal fade d-block show');
        });

        it('hides modal when clicking cancel', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            const { queryByTestId, container, queryByText } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);

            fireEvent.click(queryByText('Cancel'));

            const modalRootDiv = queryByTestId('modal-root');
            expect(modalRootDiv).not.toHaveClass('d-block show');
        });

        it('displays modal with information about the action', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            const { container, queryByText } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);

            const message = queryByText(`Are you sure to delete 'This is the latest show'?`);
            expect(message).toBeInTheDocument();
        });

        it('calls deleteShow api with show id when delete button is clicked on modal', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            apiCalls.deleteShow = jest.fn().mockResolvedValue({});
            const { container, queryByText } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);
            const deleteShowButton = queryByText('Delete Show');
            fireEvent.click(deleteShowButton);
            expect(apiCalls.deleteShow).toHaveBeenCalledWith(10);
        });

        it('hides modal after successful deleteShow api call', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            apiCalls.deleteShow = jest.fn().mockResolvedValue({});
            const { container, queryByText, queryByTestId } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);
            const deleteShowButton = queryByText('Delete Show');
            fireEvent.click(deleteShowButton);
            await waitForDomChange();
            const modalRootDiv = queryByTestId('modal-root');
            expect(modalRootDiv).not.toHaveClass('d-block show');
        });

        it('removes the deleted show from document after successful deleteShow api call', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            apiCalls.deleteShow = jest.fn().mockResolvedValue({});
            const { container, queryByText, queryByTestId } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);
            const deleteShowButton = queryByText('Delete Show');
            fireEvent.click(deleteShowButton);
            await waitForDomChange();
            const deletedShowContent = queryByText('This is the latest show');
            expect(deletedShowContent).not.toBeInTheDocument();
        });

        it('disables Modal Buttons when api call in progress', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            apiCalls.deleteShow = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({});
                    }, 300);
                });
            });
            const { container, queryByText, queryByTestId } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);
            const deleteShowButton = queryByText('Delete Show');
            fireEvent.click(deleteShowButton);
            expect(deleteShowButton).toBeDisabled();
            expect(queryByText('Cancel')).toBeDisabled();
        });

        it('displays spinner when api call in progress', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            apiCalls.deleteShow = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({});
                    }, 300);
                });
            });
            const { container, queryByText } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);
            const deleteShowButton = queryByText('Delete Show');
            fireEvent.click(deleteShowButton);
            const spinner = queryByText('Loading...');
            expect(spinner).toBeInTheDocument();
        });

        it('hides spinner when api call finishes', async () => {
            apiCalls.loadShows = jest.fn().mockResolvedValue(mockSuccessGetShowsFirstOfMultiPage);
            apiCalls.loadNewShowsCount = jest.fn().mockResolvedValue({ data: { count: 1 }});
            apiCalls.deleteShow = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({});
                    }, 300);
                });
            });
            const { container, queryByText } = setup();
            await waitForDomChange();
            const deleteButton = container.querySelectorAll('button')[0];
            fireEvent.click(deleteButton);
            const deleteShowButton = queryByText('Delete Show');
            fireEvent.click(deleteShowButton);
            await waitForDomChange();
            const spinner = queryByText('Loading...');
            expect(spinner).not.toBeInTheDocument();
        });
    });
});

console.error = () => {};