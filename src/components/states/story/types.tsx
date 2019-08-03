import {TopicState} from "../topic/types";
import {DeepReadonly} from "utility-types";

export type StoryState = DeepReadonly<{
    related?: StoryState[],
    topics?: TopicState[],
}>


export const initialStoryState: StoryState = {};

