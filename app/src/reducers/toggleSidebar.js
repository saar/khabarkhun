import {TOGGLE_SIDEBAR} from "../constants/action-types";

const toggleSidebar = (state = true, action) => {
  switch (action.type) {
    case TOGGLE_SIDEBAR:
      return !state;
    default:
      return state;
  }
};

export default toggleSidebar;
