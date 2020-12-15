import React, { Component } from 'react';
import ProfileImageWithDefault from './ProfileImageWithDefault';
import { format } from 'timeago.js';
import { Link } from 'react-router-dom';

class ShowView extends Component {
    render() {
        const { show } = this.props;
        const { user, date } = show;
        const { username, displayName, image } = user;
        const relativeDate = format(date);

        return (
            <div className="card p-1">
                <div className="d-flex">
                    <ProfileImageWithDefault 
                        className="rounded-circle"
                        width="32"
                        height="32"
                        image={image}
                    />
                    <div className="flex-fill m-auto pl-2">
                        <Link to={`/${username}`} className="list-group-item-action">
                            <h6 className="d-inline">
                                {displayName}@{username}
                            </h6>
                        </Link>
                        <span className="text-black-50"> - </span>
                        <span className="text-black-50">{relativeDate}</span>
                    </div>
                </div>
                <div className="pl-5">{show.content}</div>
            </div>
        );
    }
}

export default ShowView;