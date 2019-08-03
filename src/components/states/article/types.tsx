import {LikeState} from "../like/types";
import {DeepReadonly} from "utility-types";
import {identifier} from "../../../store/types";


type ContentState = Readonly<{}>;

export declare type ArticleState = DeepReadonly<{
    id: identifier,
    like?: LikeState,
    fullContent?: ContentState,
}>


export const initialArticleState: ArticleState = {id: "article"};

