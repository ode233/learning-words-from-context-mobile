import { configureStore } from '@reduxjs/toolkit';
import translatePopupReducer from '../components/localVideoPlayer/translate/translatePopupSlice';

export const store = configureStore({
    reducer: { translatePopup: translatePopupReducer }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
