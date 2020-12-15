import React from 'react';
import { render, waitForDomChange, waitForElement } from '@testing-library/react';
import ShowFeed from './ShowFeed';
import * as apiCalls from '../api/apiCalls';
import { MemoryRouter } from 'react-router-dom';

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
            }
        ],
        number: 0,
        first: true,
        last: false,
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
});