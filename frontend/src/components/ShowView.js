import React, { Component } from "react";
import ProfileImageWithDefault from "./ProfileImageWithDefault";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

class ShowView extends Component {
  render() {
    const { show, onClickDelete } = this.props;
    const { user, date } = show;
    const { username, displayName, image } = user;
    const relativeDate = format(date);
    const attachmentImageVisible =
      show.attachment && show.attachment.fileType.startsWith("image");

    const ownedByLoggedInUser = user.id === this.props.loggedInUser.id;

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
          {ownedByLoggedInUser && (
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={onClickDelete}
            >
              <i className="far fa-trash-alt" />
            </button>
          )}
        </div>
        <div className="pl-5">{show.content}</div>
        {attachmentImageVisible && (
          <div className="pl-5">
            <img
              alt="attachment"
              src={`/images/attachments/${show.attachment.name}`}
              className="img-fluid"
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loggedInUser: state,
  };
};

export default connect(mapStateToProps)(ShowView);
