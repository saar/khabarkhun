import {ArticleState} from "../article/types";
import {DeepReadonly} from "utility-types";


export declare type TopicState = DeepReadonly<{
    articles: ArticleState[],
}>

// export type StoriesAction = ActionType<{ typeof actions }>;

export const initialTopicState: TopicState = {articles: []};

