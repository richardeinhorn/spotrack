import { ReactComponent as LogoLight } from "../../assets/spotrack-logo-wordmark--light.svg";
import { ReactComponent as LogoDark } from "../../assets/spotrack-logo-wordmark--dark.svg";

const Logo = ({isDarkMode}) => {
  return (
    <header id="header">
      <div className="logo-container">
        {isDarkMode ? <LogoDark /> : <LogoLight />}
      </div>
    </header>
  );
};

export default Logo;
