import * as likeActions from './like/action';
import * as articleActions from './article/action';
import {createAction} from "typesafe-actions";


export default {
    ...likeActions,
    ...articleActions,
}