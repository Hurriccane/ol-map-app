import { configureStore } from '@reduxjs/toolkit';
import markersReducer from './slices/markersSlice';
export const store = configureStore({
  reducer: {
    markers: markersReducer, // Здесь 'markers' - это название ветки в состоянии Redux
  },
  // Опционально: можно добавить middleware, devTools и другие настройки
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== 'production',
});

// Типы для работы с хранилищем
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;