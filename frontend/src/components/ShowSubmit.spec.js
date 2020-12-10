import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ShowSubmit from './ShowSubmit';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import authReducer from '../redux/authReducer';

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
    });
});