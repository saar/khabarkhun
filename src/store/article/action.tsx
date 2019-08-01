import {createAction} from "typesafe-actions";
import {LikeState} from "../like/types";


export const like = createAction('article/like', action => {
    return () => action();
});

export const dislike = createAction('article/dislike', action => {
    return () => action();
});
