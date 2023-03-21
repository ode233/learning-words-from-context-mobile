import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../redux/store';

// Define a type for the slice state
interface LocalVideoState {
    isVidoPlay?: boolean;
}

// Define the initial state using that type
const initialState: LocalVideoState = {};

export const localVideoSlice = createSlice({
    name: 'localVideo',
    initialState,
    reducers: {
        playVideo: (state) => {
            state.isVidoPlay = true;
        },
        stopVideo: (state) => {
            state.isVidoPlay = false;
        }
    }
});

export const { playVideo, stopVideo } = localVideoSlice.actions;

export const selectIsVideoPlay = (state: RootState) => state.localVideo.isVidoPlay;

const localVideoReducer = localVideoSlice.reducer;
export default localVideoReducer;
