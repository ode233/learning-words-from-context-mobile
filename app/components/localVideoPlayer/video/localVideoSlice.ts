import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../redux/store';
import { ContextFromVideo } from './localVideoClass';

// Define a type for the slice state
interface LocalVideoState {
    isPlaying?: boolean;
    contextFromVideo?: ContextFromVideo;
    getContextFromVideoTrigger?: {};
}

// Define the initial state using that type
const initialState: LocalVideoState = {};

export const localVideoSlice = createSlice({
    name: 'localVideo',
    initialState,
    reducers: {
        updateIsPlaying: (state, action: PayloadAction<boolean, string>) => {
            state.isPlaying = action.payload;
        },
        getContextFromVideo: (state) => {
            state.getContextFromVideoTrigger = {};
        },
        updateContextFromVideo: (state, action: PayloadAction<ContextFromVideo, string>) => {
            state.contextFromVideo = action.payload;
        }
    }
});

export const { updateIsPlaying, getContextFromVideo, updateContextFromVideo } = localVideoSlice.actions;

export const selectIsPlaying = (state: RootState) => state.localVideo.isPlaying;

export const selectContextFromVideoTrigger = (state: RootState) => state.localVideo.getContextFromVideoTrigger;

export const selectContextFromVideo = (state: RootState) => state.localVideo.contextFromVideo;

const localVideoReducer = localVideoSlice.reducer;
export default localVideoReducer;
