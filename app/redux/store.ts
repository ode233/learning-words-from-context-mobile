import { configureStore } from '@reduxjs/toolkit';
import subtitleReducer from '../components/localVideoPlayer/subtitle/subtitleSlice';
import translatePopupReducer from '../components/localVideoPlayer/translate/translatePopupSlice';
import localVideoReducer from '../components/localVideoPlayer/video/localVideoSlice';

export const store = configureStore({
    reducer: { translatePopup: translatePopupReducer, subtitle: subtitleReducer, localVideo: localVideoReducer }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
