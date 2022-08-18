import React from "react";

const AboutSection = () => {
  return (
    <div className="about">
      <h1>About Spotrack</h1>
      <p style={{ textAlign: "center" }}>
        Spotrack records your Spotify listening to your Google calendar. Travel
        through time and discover what songs you listened to at every moment.
      </p>
      <a href="https://github.com/richardeinhorn/spotrack">
        <img
          alt="GitHub"
          src="https://img.shields.io/badge/Github-open--source--repository-green?logo=github&style=for-the-badge"
        />
      </a>
    </div>
  );
};

export default AboutSection;
