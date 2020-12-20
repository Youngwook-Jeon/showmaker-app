import React from 'react';
import { render } from '@testing-library/react';
import ShowView from './ShowView';
import { MemoryRouter } from 'react-router-dom';

const showWithoutAttachment = {
    id: 10,
    content: 'This is the first show',
    user: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png'
    }
};

const showWithAttachment = {
    id: 10,
    content: 'This is the first show',
    user: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png'
    },
    attachment: {
        fileType: 'image/png',
        name: 'attached-image.png'
    }
};

const showWithPdfAttachment = {
    id: 10,
    content: 'This is the first show',
    user: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png'
    },
    attachment: {
        fileType: 'application/pdf',
        name: 'attached.pdf'
    }
};

const setup = (show = showWithoutAttachment) => {
    const oneMinute = 60 * 1000;
    const date = new Date(new Date() - oneMinute);
    show.date = date;
    return render(
        <MemoryRouter>
            <ShowView show={show} />
        </MemoryRouter>
    ); 
};

describe('ShowView', () => {
    describe('Layout', () => {
        it('displays show content', () => {
            const { queryByText } = setup();
            expect(queryByText('This is the first show')).toBeInTheDocument();
        });

        it('displays users image', () => {
            const { container } = setup();
            const image = container.querySelector('img');
            expect(image.src).toContain('/images/profile/profile1.png');
        });

        it('displays displayName@user', () => {
            const { queryByText } = setup();
            expect(queryByText('display1@user1')).toBeInTheDocument();
        });

        it('displays relative time', () => {
            const { queryByText } = setup();
            expect(queryByText('1 minute ago')).toBeInTheDocument();
        });

        it('has link to user page', () => {
            const { container } = setup();
            const anchor = container.querySelector('a');
            expect(anchor.getAttribute('href')).toBe('/user1');
        });

        it('displays file attachment image', () => {
            const { container } = setup(showWithAttachment);
            const images = container.querySelectorAll('img');
            expect(images.length).toBe(2);
        });

        it('does not displays file attachment when attachment type is not image', () => {
            const { container } = setup(showWithPdfAttachment);
            const images = container.querySelectorAll('img');
            expect(images.length).toBe(1);
        });

        it('set the attachment path as source for file attachment image', () => {
            const { container } = setup(showWithAttachment);
            const images = container.querySelectorAll('img');
            const attachmentImage = images[1];
            expect(attachmentImage.src).toContain('/images/attachments/' + 
                showWithAttachment.attachment.name);
        });
    });
});