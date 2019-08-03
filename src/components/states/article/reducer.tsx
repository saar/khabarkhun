import {initialArticleState} from "./types";
import {createReducer} from "typesafe-actions";
import {dislike, like} from './action';
import {LikeReducer} from "../like/reducer";
import * as LikeActions from "../like/action";


const ArticleReducer = createReducer(initialArticleState)
    .handleAction(like, state => ({...state, like: LikeReducer(state.like, LikeActions.like())}))
    .handleAction(dislike, state => ({...state, like: LikeReducer(state.like, LikeActions.dislike())}));

export default ArticleReducer;
