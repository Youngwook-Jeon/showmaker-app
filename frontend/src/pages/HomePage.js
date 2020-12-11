import React from 'react';
import UserList from '../components/UserList';
import ShowSubmit from '../components/ShowSubmit';
import { connect } from 'react-redux';

class HomePage extends React.Component {
    render() {
        return (
            <div data-testid="homepage" >
                <div className="row">
                    <div className="col-8">
                        {this.props.loggedInUser.isLoggedIn && <ShowSubmit />}
                    </div>
                    <div className="col-4">
                        <UserList />
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        loggedInUser: state
    };
};

export default connect(mapStateToProps)(HomePage);