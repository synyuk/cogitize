import { AnyAction, combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { swapApi } from "@/05.features/swap/api";

const testReducer = (state = {}) => state;

const combines = combineReducers({
  test: testReducer,
  [swapApi.reducerPath]: swapApi.reducer,
});

const rootReducer = (
  state: ReturnType<typeof combines> | undefined,
  action: AnyAction,
) => {
  if (action.type === "user/logout") {
    state = undefined;
  }
  return combines(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(swapApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
