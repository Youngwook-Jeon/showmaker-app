import React from 'react';
import { render, fireEvent, waitForDomChange } from '@testing-library/react';
import ShowSubmit from './ShowSubmit';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import authReducer from '../redux/authReducer';
import * as apiCalls from '../api/apiCalls';

const defaultState = {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png',
    password: 'P4ssword',
    isLoggedIn: true
};

let store;

const setup = (state = defaultState) => {
    store = createStore(authReducer, state);

    return render(
        <Provider store={store}>
            <ShowSubmit />
        </Provider>
    );
};

describe('ShowSubmit', () => {
    describe('Layout', () => {
        it('has textarea', () => {
            const { container } = setup();
            const textArea = container.querySelector('textarea');
            expect(textArea).toBeInTheDocument();
        });

        it('has image', () => {
            const { container } = setup();
            const image = container.querySelector('img');
            expect(image).toBeInTheDocument();
        });

        it('displays textarea 1 line', () => {
            const { container } = setup();
            const textArea = container.querySelector('textarea');
            expect(textArea.rows).toBe(1);
        });

        it('displays user image', () => {
            const { container } = setup();
            const image = container.querySelector('img');
            expect(image.src).toContain('/images/profile/' + defaultState.image);
        });
    });
    describe('Interactions', () => {
        it('displays 3 rows when focused to textarea', () => {
            const { container } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            expect(textArea.rows).toBe(3);
        });

        it('displays the Make button when focused to textarea', () => {
            const { container, queryByText } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            const makeButton = queryByText('Make');
            expect(makeButton).toBeInTheDocument();
        });

        it('displays the Cancel button when focused to textarea', () => {
            const { container, queryByText } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            const cancelButton = queryByText('Cancel');
            expect(cancelButton).toBeInTheDocument();
        });

        it('does not display the Make button when not focused to textarea', () => {
            const { queryByText } = setup();
            const makeButton = queryByText('Make');
            expect(makeButton).not.toBeInTheDocument();
        });

        it('does not display the Cancel button when not focused to textarea', () => {
            const { queryByText } = setup();
            const cancelButton = queryByText('Cancel');
            expect(cancelButton).not.toBeInTheDocument();
        });

        it('returns back to unfocused state after clicking the cancel', () => {
            const { container, queryByText } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            const cancelButton = queryByText('Cancel');
            fireEvent.click(cancelButton);
            expect(queryByText('Cancel')).not.toBeInTheDocument();
        });

        it('calls postShow with show request object when clicking the Make button', () => {
            const { container, queryByText } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, { target: { value: 'Test show content' } });

            const makeButton = queryByText('Make');
            apiCalls.postShow = jest.fn().mockResolvedValue({});
            fireEvent.click(makeButton);

            expect(apiCalls.postShow).toHaveBeenCalledWith({
                content: 'Test show content'
            });
        });

        it('returns back to unfocused state after successful postShow action', async () => {
            const { container, queryByText } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, { target: { value: 'Test show content' } });

            const makeButton = queryByText('Make');
            apiCalls.postShow = jest.fn().mockResolvedValue({});
            fireEvent.click(makeButton);

            await waitForDomChange();
            expect(queryByText('Make')).not.toBeInTheDocument();
        });

        it('clears content after successful postShow action', async () => {
            const { container, queryByText } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, { target: { value: 'Test show content' } });

            const makeButton = queryByText('Make');
            apiCalls.postShow = jest.fn().mockResolvedValue({});
            fireEvent.click(makeButton);

            await waitForDomChange();
            expect(queryByText('Test show content')).not.toBeInTheDocument();
        });

        it('clears content after clicking cancel', () => {
            const { container, queryByText } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, { target: { value: 'Test show content' } });

            fireEvent.click(queryByText('Cancel'));
            expect(queryByText('Test show content')).not.toBeInTheDocument();
        });

        it('disables Make button when there is postShow api call', async () => {
            const { container, queryByText } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, { target: { value: 'Test show content' } });

            const makeButton = queryByText('Make');
            const mockFunction = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({});
                    }, 300);
                });
            });
            apiCalls.postShow = mockFunction;
            fireEvent.click(makeButton);
            fireEvent.click(makeButton);

            expect(mockFunction).toHaveBeenCalledTimes(1);
        });

        it('disables Cancel button when there is postShow api call', async () => {
            const { container, queryByText } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, { target: { value: 'Test show content' } });

            const makeButton = queryByText('Make');
            const mockFunction = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({});
                    }, 300);
                });
            });
            apiCalls.postShow = mockFunction;
            fireEvent.click(makeButton);
            const cancelButton = queryByText('Cancel');

            expect(cancelButton).toBeDisabled();
        });

        it('displays spinner when there is postShow api call', async () => {
            const { container, queryByText } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, { target: { value: 'Test show content' } });

            const makeButton = queryByText('Make');
            const mockFunction = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({});
                    }, 300);
                });
            });
            apiCalls.postShow = mockFunction;
            fireEvent.click(makeButton);

            expect(queryByText('Now Loading...')).toBeInTheDocument();
        });

        it('enables Make button when postShow api call fails', async () => {
            const { container, queryByText } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, { target: { value: 'Test show content' } });

            const makeButton = queryByText('Make');
            const mockFunction = jest.fn().mockRejectedValueOnce({
                response: {
                    data: {
                        validationErrors: {
                            content: 'It must have minimum 10 and maximum 5000 characters'
                        }
                    }
                }
            });
            apiCalls.postShow = mockFunction;
            fireEvent.click(makeButton);
            await waitForDomChange();

            expect(queryByText('Make')).not.toBeDisabled();
        });

        it('enables Cancel button when postShow api call fails', async () => {
            const { container, queryByText } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, { target: { value: 'Test show content' } });

            const makeButton = queryByText('Make');
            const mockFunction = jest.fn().mockRejectedValueOnce({
                response: {
                    data: {
                        validationErrors: {
                            content: 'It must have minimum 10 and maximum 5000 characters'
                        }
                    }
                }
            });
            apiCalls.postShow = mockFunction;
            fireEvent.click(makeButton);
            await waitForDomChange();

            expect(queryByText('Cancel')).not.toBeDisabled();
        });

        it('enables Make button after successful postShow action', async () => {
            const { container, queryByText } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, { target: { value: 'Test show content' } });

            const makeButton = queryByText('Make');
            apiCalls.postShow = jest.fn().mockResolvedValue({});
            fireEvent.click(makeButton);

            await waitForDomChange();

            fireEvent.focus(textArea);
            expect(queryByText('Make')).not.toBeDisabled();
        });

        it('displays validation error for content', async () => {
            const { container, queryByText } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, { target: { value: 'Test show content' } });

            const makeButton = queryByText('Make');
            const mockFunction = jest.fn().mockRejectedValueOnce({
                response: {
                    data: {
                        validationErrors: {
                            content: 'It must have minimum 10 and maximum 5000 characters'
                        }
                    }
                }
            });
            apiCalls.postShow = mockFunction;
            fireEvent.click(makeButton);
            await waitForDomChange();

            expect(queryByText('It must have minimum 10 and maximum 5000 characters')).toBeInTheDocument();
        });

        it('clears validation error after clicking Cancel button', async () => {
            const { container, queryByText } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, { target: { value: 'Test show content' } });

            const makeButton = queryByText('Make');
            const mockFunction = jest.fn().mockRejectedValueOnce({
                response: {
                    data: {
                        validationErrors: {
                            content: 'It must have minimum 10 and maximum 5000 characters'
                        }
                    }
                }
            });
            apiCalls.postShow = mockFunction;
            fireEvent.click(makeButton);
            await waitForDomChange();
            fireEvent.click(queryByText('Cancel'));

            expect(queryByText('It must have minimum 10 and maximum 5000 characters')).not.toBeInTheDocument();
        });

        it('clears validation error after content is changed', async () => {
            const { container, queryByText } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, { target: { value: 'Test show content' } });

            const makeButton = queryByText('Make');
            const mockFunction = jest.fn().mockRejectedValueOnce({
                response: {
                    data: {
                        validationErrors: {
                            content: 'It must have minimum 10 and maximum 5000 characters'
                        }
                    }
                }
            });
            apiCalls.postShow = mockFunction;
            fireEvent.click(makeButton);
            await waitForDomChange();
            fireEvent.change(textArea, { target: { value: 'Test show content' } });

            expect(queryByText('It must have minimum 10 and maximum 5000 characters')).not.toBeInTheDocument();
        });
    });
});