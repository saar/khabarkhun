import {createAction} from "typesafe-actions";


export const like = createAction('like/like', action => {
    return () => action();
});
export const dislike = createAction('like/dislike', action => {
    return () => action();
});