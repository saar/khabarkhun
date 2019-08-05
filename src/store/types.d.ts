// types.d.ts
import {ActionType, StateType} from 'typesafe-actions';


declare module 'KhabarkhunTypes' {
    export type Store = StateType<typeof import('./index').default>;
    export type RootAction = ActionType<typeof import('../actions').default>;
    export type RootState = StateType<ReturnType<typeof import('./index').default>>;
    export type RootAPI = import('../api/index').ApiType;
}

declare module 'typesafe-actions' {
    interface Types {
        RootAction: ActionType<typeof import('./index').default>;
    }
}