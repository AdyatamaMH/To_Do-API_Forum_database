
import React from 'react';

function FullName({ fullName, number }) {
  return (
    <div>
      <h3>Name: {fullName}</h3>
      <p>NIM: {number}</p>
    </div>
  );
}

export default FullName;
