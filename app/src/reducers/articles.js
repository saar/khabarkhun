import {ARTICLES_CATEGORY_LOADED, ARTICLES_LOADED} from "../constants/action-types";

const articles = (state = [], action) => {
  switch (action.type) {
    case ARTICLES_LOADED:
      if (action.payload.reset) return action.payload.data;
      return state.concat(action.payload.data);
    case ARTICLES_CATEGORY_LOADED:
      if (action.payload.reset) return action.payload.data;
      return state.concat(action.payload.data);
    default:
      return state;
  }
};

export default articles;
