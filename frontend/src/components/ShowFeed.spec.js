import React from 'react';
import { fireEvent, render, waitForDomChange, waitForElement } from '@testing-library/react';
import ShowFeed from './ShowFeed';
import * as apiCalls from '../api/apiCalls';
import { MemoryRouter } from 'react-router-dom';

const originalSetInterval = window.setInterval;
const originalClearInterval = window.clearInterval;

let timedFunction;

const useFakeIntervals = () => {
    window.setInterval = (callback, interval) => {
        timedFunction = callback;
    };
    window.clearInterval = () => {
        timedFunction = undefined;
    };
};

const useRealIntervals = () => {
    window.setInterval = originalSetInterval;
    window.clearInterval = originalClearInterval;
};

const runTimer = () => {
    timedFunction && timedFunction();
}
const setup = (props) => {
    return render(
        <MemoryRouter>
            <ShowFeed {...props} />
        </MemoryRouter>
    );
};

const mockEmptyResponse = {
    data: {
        content: []
    }
};

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
    });
});

console.error = () => {};