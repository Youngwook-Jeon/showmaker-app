import React, { Component } from "react";
import * as apiCalls from "../api/apiCalls";
import Spinner from "./Spinner";
import ShowView from "./ShowView";
import Modal from "./Modal";

class ShowFeed extends Component {
  state = {
    page: {
      content: [],
    },
    isLoadingShows: false,
    newShowCount: 0,
    isLoadingOldShows: false,
    isLoadingNewShows: false,
    isDeletingShow: false,
  };

  componentDidMount() {
    this.setState({ isLoadingShows: true });
    apiCalls.loadShows(this.props.user).then((response) => {
      this.setState({ page: response.data, isLoadingShows: false }, () => {
        this.counter = setInterval(this.checkCount, 2000);
      });
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
    apiCalls.loadNewShowsCount(topShowId, this.props.user).then((response) => {
      this.setState({ newShowCount: response.data.count });
    });
  };

  onClickLoadMore = () => {
    const shows = this.state.page.content;
    if (shows.length === 0) {
      return;
    }
    const showAtBottom = shows[shows.length - 1];
    this.setState({ isLoadingOldShows: true });
    apiCalls
      .loadOldShows(showAtBottom.id, this.props.user)
      .then((response) => {
        const page = { ...this.state.page };
        page.content = [...page.content, ...response.data.content];
        page.last = response.data.last;
        this.setState({ page, isLoadingOldShows: false });
      })
      .catch((error) => {
        this.setState({ isLoadingOldShows: false });
      });
  };

  onClickLoadNew = () => {
    const shows = this.state.page.content;
    let topShowId = 0;
    if (shows.length > 0) {
      topShowId = shows[0].id;
    }
    this.setState({ isLoadingNewShows: true });
    apiCalls
      .loadNewShows(topShowId, this.props.user)
      .then((response) => {
        const page = { ...this.state.page };
        page.content = [...response.data, ...page.content];
        this.setState({ page, newShowCount: 0, isLoadingNewShows: false });
      })
      .catch((error) => {
        this.setState({ isLoadingNewShows: false });
      });
  };

  onClickDeleteShow = (show) => {
    this.setState({ showToBeDeleted: show });
  };

  onClickModalCancel = () => {
    this.setState({ showToBeDeleted: undefined });
  };

  onClickModalOk = () => {
    this.setState({ isDeletingShow: true });
    apiCalls.deleteShow(this.state.showToBeDeleted.id).then((response) => {
      const page = { ...this.state.page };
      page.content = page.content.filter(
        (show) => show.id !== this.state.showToBeDeleted.id
      );
      this.setState({
        showToBeDeleted: undefined,
        page,
        isDeletingShow: false,
      });
    });
  };

  render() {
    if (this.state.isLoadingShows) {
      return <Spinner />;
    }
    if (this.state.page.content.length === 0 && this.state.newShowCount === 0) {
      return (
        <div className="card card-header text-center">There are no shows</div>
      );
    }
    const newShowCountMessage =
      this.state.newShowCount === 1
        ? "There is 1 new show"
        : `There are ${this.state.newShowCount} new shows`;

    return (
      <div>
        {this.state.newShowCount > 0 && (
          <div
            className="card card-header text-center"
            onClick={!this.state.isLoadingNewShows && this.onClickLoadNew}
            style={{
              cursor: this.state.isLoadingNewShows ? "not-allowed" : "pointer",
            }}
          >
            {this.state.isLoadingNewShows ? <Spinner /> : newShowCountMessage}
          </div>
        )}
        {this.state.page.content.map((show) => {
          return (
            <ShowView
              key={show.id}
              show={show}
              onClickDelete={() => this.onClickDeleteShow(show)}
            />
          );
        })}
        {this.state.page.last === false && (
          <div
            className="card card-header text-center"
            onClick={!this.state.isLoadingOldShows && this.onClickLoadMore}
            style={{
              cursor: this.state.isLoadingOldShows ? "not-allowed" : "pointer",
            }}
          >
            {this.state.isLoadingOldShows ? <Spinner /> : "Load More"}
          </div>
        )}
        <Modal
          visible={this.state.showToBeDeleted && true}
          onClickCancel={this.onClickModalCancel}
          body={
            this.state.showToBeDeleted &&
            `Are you sure to delete '${this.state.showToBeDeleted.content}'?`
          }
          title="Delete!"
          okButton="Delete Show"
          onClickOK={this.onClickModalOk}
          pendingApiCall={this.state.isDeletingShow}
        />
      </div>
    );
  }
}

export default ShowFeed;
