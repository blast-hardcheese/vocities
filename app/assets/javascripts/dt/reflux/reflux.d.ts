declare module Reflux {
    export interface CreateStoreOptions {
    }

    export interface RefluxStore {
        listen<T>(x: T): void;
    }

    export interface RefluxStatic {
        createAction: () => (...values: any[]) => void;

        createStore: (opts: CreateStoreOptions) => RefluxStore;
    }
}
