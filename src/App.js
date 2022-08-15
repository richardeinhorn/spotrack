import { useState } from "react";
import "./App.css";
import { ReactComponent as Logo } from "./assets/spotrack-logo-wordmark--light.svg";
import SignupForm from "./components/SignupForm";

const App = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [values, setValues] = useState({});

  const onSubmit = () => {
    console.log(JSON.stringify(values));
  };

  return (
    <main className="app">
      <header id="header">
        <div className="logo-container">
          <Logo />
        </div>
      </header>
      <div className="content">
        {showSignup ? (
          <div className="signup">
            <SignupForm />
            <button
              id="signup-btn"
              type="button"
              class="btn btn-danger"
              onClick={() => setShowSignup(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="signup">
            <button
              id="signup-btn"
              type="button"
              class="btn btn-primary"
              onClick={() => setShowSignup(true)}
            >
              Sign up now
            </button>
            <p>
              Start tracking songs in minutes for free. No credit card required.
            </p>
          </div>
        )}
        <div className="about">
          <h1>About Spotrack</h1>
          <p>
            Spotrack records your Spotify listening to your Google calendar.
            Travel through time and discover what songs you listened to at every
            moment.
          </p>
          <a href="https://github.com/richardeinhorn/spotrack">
            <img
              alt="GitHub"
              src="https://img.shields.io/badge/Github-open--source--repository-green?logo=github&style=for-the-badge"
            />
          </a>
        </div>
      </div>
    </main>
  );
};

export default App;
