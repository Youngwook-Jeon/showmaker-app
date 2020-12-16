import React, { Component } from 'react';
import * as apiCalls from '../api/apiCalls';
import Spinner from './Spinner';
import ShowView from './ShowView';

class ShowFeed extends Component {

    state = {
        page: {
            content: []
        },
        isLoadingShows: false,
        newShowCount: 0
    };

    componentDidMount() {
        this.setState({ isLoadingShows: true });
        apiCalls.loadShows(this.props.user)
            .then(response => {
                this.setState(
                    { page: response.data, isLoadingShows: false },
                    () => {
                        this.counter = setInterval(this.checkCount, 2000);
                    }
                );
            });
    }

    componentWillUnmount() {
        clearInterval(this.counter);
    }

    checkCount = () => {
        const shows = this.state.page.content;
        let topShowId = 0;
        if (shows.length > 0) {
            topShowId = shows[0].id;
        }
        apiCalls.loadNewShowsCount(topShowId, this.props.user)
            .then(response => {
                this.setState({ newShowCount: response.data.count });
            });
    };

    onClickLoadMore = () => {
        const shows = this.state.page.content;
        if (shows.length === 0) {
            return;
        }
        const showAtBottom = shows[shows.length - 1];
        apiCalls.loadOldShows(showAtBottom.id, this.props.user)
            .then(response => {
                const page = { ...this.state.page };
                page.content = [ ...page.content, ...response.data.content ];
                page.last = response.data.last;
                this.setState({ page });
            });
    };

    render() {
        if (this.state.isLoadingShows) {
            return (
                <Spinner />
            );
        }
        if (this.state.page.content.length === 0 && this.state.newShowCount === 0 ) {
            return (
                <div className="card card-header text-center">
                    There are no shows
                </div>
            );
        }

        return (
            <div>
                {this.state.newShowCount > 0 && (
                    <div className="card card-header text-center">
                        {this.state.newShowCount === 1 ? 
                            'There is 1 new show' : 
                            `There are ${this.state.newShowCount} new shows`
                        }
                    </div>
                )}
                {this.state.page.content.map(show => {
                    return <ShowView key={show.id} show={show} />;
                })}
                {this.state.page.last === false && (
                    <div 
                        className="card card-header text-center"
                        onClick={this.onClickLoadMore}
                        style={{ cursor: 'pointer' }}
                    >
                        Load More
                    </div>
                )}
            </div>
        );
    }
}

export default ShowFeed;