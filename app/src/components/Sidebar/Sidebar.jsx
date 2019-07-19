import React from "react";
import {NavLink} from "react-router-dom";
import "./Sidebar.scss";

const Sidebar = ({items}) => {
  return (
    <ul className="items">
      {items.map(item => (
        <li key={item._id} className="item">
          <NavLink
            exact onClick={()=>{window.scrollTo(0, 0);}}
            className="link"
            to={item.to}
          >
            <i className="material-icons">{item.icon}</i>
            {item.text}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default Sidebar;
