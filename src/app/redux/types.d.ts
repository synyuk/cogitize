import type { store } from "./store";

type ReduxAppDispatch = typeof store.dispatch;

declare global {
  export type RootState = ReturnType<typeof store.getState>;
  export type AppDispatch = ReduxAppDispatch;
}
