import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../redux/store';
import { ContextFromVideo } from './localVideoClass';

// Define a type for the slice state
interface LocalVideoState {
    isPlaying?: boolean;
    contextFromVideo?: ContextFromVideo;
    getContextFromVideoTrigger?: {};
    videoName: string;
}

// Define the initial state using that type
const initialState: LocalVideoState = {
    videoName: 'wait for play'
};

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
        },
        updateVideoName: (state, action: PayloadAction<string, string>) => {
            state.videoName = action.payload;
        }
    }
});

export const { updateIsPlaying, getContextFromVideo, updateContextFromVideo, updateVideoName } =
    localVideoSlice.actions;

export const selectIsPlaying = (state: RootState) => state.localVideo.isPlaying;

export const selectContextFromVideoTrigger = (state: RootState) => state.localVideo.getContextFromVideoTrigger;

export const selectContextFromVideo = (state: RootState) => state.localVideo.contextFromVideo;

export const selectVideoName = (state: RootState) => state.localVideo.videoName;

const localVideoReducer = localVideoSlice.reducer;
export default localVideoReducer;
