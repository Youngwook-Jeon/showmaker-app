import React, { Component } from 'react';
import * as apiCalls from '../api/apiCalls';
import Spinner from './Spinner';
import ShowView from './ShowView';

class ShowFeed extends Component {

    state = {
        page: {
            content: []
        },
        isLoadingShows: false
    };

    componentDidMount() {
        this.setState({ isLoadingShows: true });
        apiCalls.loadShows(this.props.user)
            .then(response => {
                this.setState({ page: response.data, isLoadingShows: false });
            });
    }

    render() {
        if (this.state.isLoadingShows) {
            return (
                <Spinner />
            );
        }
        if (this.state.page.content.length === 0) {
            return (
                <div className="card card-header text-center">
                    There are no shows
                </div>
            );
        }

        return (
            <div>
                {this.state.page.content.map(show => {
                    return <ShowView key={show.id} show={show} />;
                })}
                {this.state.page.last === false && (
                    <div className="card card-header text-center">
                        Load More
                    </div>
                )}
            </div>
        );
    }
}

export default ShowFeed;