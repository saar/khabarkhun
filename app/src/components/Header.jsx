import React from "react";
import { Link } from "react-router-dom";
import logo from "./logo.svg";
import logoType from "./logotype.svg";
import "./Header.scss";
import {connect} from "react-redux";
import {toggleSidebar} from "../actions";


const Header = (props) => {
  return (
    <header className="header">
      <div className="brand">
        <div className="sidebar-btn" onClick={() => props.toggleSidebar()}>
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
};

export default connect(null,{toggleSidebar})(Header);
