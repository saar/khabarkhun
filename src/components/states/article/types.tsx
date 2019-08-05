import {LikeState} from "../like/types";
import {DeepReadonly} from "utility-types";


type ContentState = Readonly<{}>;

export declare type ArticleState = DeepReadonly<{
    id: string,
    like?: LikeState,
    content?: ContentState,
}>


export const initialArticleState: ArticleState = {id: "article"};

