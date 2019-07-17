import {ARTICLES_LOADED} from "../constants/action-types";

const articles = (state = [], action) => {
  switch (action.type) {
    case ARTICLES_LOADED:

      return state.concat(action.payload);
    default:
      return state;
  }
};

export default articles;
