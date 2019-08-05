import {createAction, createAsyncAction} from "typesafe-actions";
import {Article} from "KhabarkhunTypes";

export const dislike = createAction('article/dislike', action => {
    return () => action();
});


export const likeAction = createAsyncAction(
    'article/like',
    'article/like/success',
    'article/like/failure'
)<string, Article, Error>();
