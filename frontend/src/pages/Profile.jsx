import React from 'react';
import ProfileTop from '../components/ProfileTop';
import ProfileBottom from '../components/ProfileBottom';
function Profile() {
    return ( 
    <div style={{height:"h-full"}} className='p-5 eco-static-bg  '>
    <ProfileTop/>
    <ProfileBottom/>
    </div> );
}

export default Profile;