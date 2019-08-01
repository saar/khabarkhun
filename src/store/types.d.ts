// types.d.ts
import {ActionType, StateType} from 'typesafe-actions';


export type identifier = string;


declare module 'AppRoot' {
    export type Store = StateType<typeof import('./index').default>;
    export type RootAction = ActionType<typeof import('../actions/index').default>;
    export type RootState = StateType<ReturnType<typeof import('../reducers/index').default>>;
}

declare module 'typesafe-actions' {
    interface Types {
        RootAction: ActionType<typeof import('../actions/index').default>;
    }
}