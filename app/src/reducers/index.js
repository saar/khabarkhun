import {combineReducers} from 'redux'
import article from './article';
import articles from './articles';
import requestSend from './requestSend';
import toggleSidebar from './toggleSidebar';

export default combineReducers({
  article,
  articles,
  requestSend,
  isSidebar: toggleSidebar
})
