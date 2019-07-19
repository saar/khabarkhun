import {REQUEST_SEND} from "../constants/action-types";

const requestSend = (state = false, action) => {
  switch (action.type) {
    case REQUEST_SEND:
      return action.payload;
    default:
      return state;
  }
};

export default requestSend;
