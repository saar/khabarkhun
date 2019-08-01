import {createReducer} from "typesafe-actions";
import {dislike, like} from "./action";
import {initialLikeState} from "./types";


export const LikeReducer = createReducer(initialLikeState)
    .handleAction(like, state => ({...state, liked: true, likes: state.likes + 1,}))
    .handleAction(dislike, state => ({...state, disliked: true, dislikes: state.dislikes + 1,}));
