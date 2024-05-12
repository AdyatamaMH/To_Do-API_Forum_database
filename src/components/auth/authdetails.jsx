import { onAuthStateChanged, signOut, setPersistence, browserSessionPersistence } from "firebase/auth"; 
import React, { useEffect, useState } from "react";
import { auth } from "../../firebase.js";

const AuthDetails = () => {
    const [authUser, setAuthUser] = useState(null);

    useEffect(() => {
        const listen = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthUser(user);
            } else {
                setAuthUser(null);
            }
        });

        // Set session persistence
        setPersistence(auth, browserSessionPersistence)
            .then(() => {
            })
            .catch((error) => {
                console.log(error);
            });

        return () => {
            listen();
        };
    }, []);

    const userlogOut = () => {
        signOut(auth)
            .then(() => {
                console.log('Log out successful');
            })
            .catch(error => console.log(error));
    };

    return (
        <div> 
            {authUser ? <>
                <p> {`Logged In as ${authUser.email}`} </p> 
                <button onClick={userlogOut}> Log Out </button> 
            </> : <p> Logged Out </p>} 
        </div>
    );
};

export default AuthDetails;
