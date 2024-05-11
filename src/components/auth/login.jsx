import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import React, { useState } from "react";
import { auth } from "../../firebase.js";

const SignIn = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signIn = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log(userCredential);
                onLoginSuccess(); 
            }).catch((error) => {
                console.log(error);
            });
    };

    const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log(result);
                onLoginSuccess();
            }).catch((error) => {
                console.log(error);
            });
    };

    return (
        <div className='login-container'>
            <form onSubmit={signIn}>
                <h1>Log In to your Account</h1>
                <input
                    type="email"
                    placeholder='Enter your email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                ></input>
                <input
                    type="password"
                    placeholder='Enter your password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                ></input>
                <button type="submit">Log In</button>
            </form>
            <button onClick={signInWithGoogle}>Log In with Google</button>
        </div>
    );
};

export default SignIn;