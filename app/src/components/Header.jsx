import React, {Component} from "react";
import { Link } from "react-router-dom";
import logo from "./logo.svg";
import logoType from "./logotype.svg";
import "./Header.scss";


const toggleSidebar = () => {
  if (!this.state.isSidebar && window.innerWidth < 768)
    document.addEventListener("click", this.hide);
  else document.removeEventListener("click", this.hide);

  this.setState({isSidebar: !this.state.isSidebar});
};

class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {isSidebar:true};
  }

  render() {
    return (
      <header className="header">
        <div className="brand">
          <div className="sidebar-btn" onClick={toggleSidebar}>
            <i className="material-icons">menu</i>
          </div>
          <Link className="brand-link" to="/">
            <img className="logo" src={logo} alt="خبرخون"/>
            <img className="logotype" src={logoType} alt="خبرخون"/>
          </Link>
          <span className="brand-subtitle d-none d-md-inline-block">
          رسانه هوشمند خبری
        </span>
          <span className="beta">(بتا)</span>
        </div>
      </header>
    );
  }
}
export default Header;
