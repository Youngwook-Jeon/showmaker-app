import React from 'react';
import defaultPicture from '../assets/profile-icon.png';

const ProfileImageWithDefault = (props) => {
    let imageSource = defaultPicture;
    if (props.image) {
        imageSource = `/images/profile/${props.image}`
    }
    return (
        //eslint-disable-next-line
        <img 
            {...props} 
            src={props.src || imageSource}
            onError={event => {
                event.target.src = defaultPicture
            }} 
        />
    );
};

export default ProfileImageWithDefault;