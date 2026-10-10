import { configureStore } from "@reduxjs/toolkit";
import reducers from "./reducers";
import { persistListener } from "./persist-listener";

export const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistListener.middleware),
});

export type AppDispatch = typeof store.dispatch;
