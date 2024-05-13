import React from 'react';

function UserProfile({ currentUser }) {
  return (
    <div>
      <h2>User Profile</h2>
      {currentUser && <p>Logged in as: {currentUser.email}</p>}
    </div>
  );
}

export default UserProfile;
