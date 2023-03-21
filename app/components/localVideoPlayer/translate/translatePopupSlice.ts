import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../redux/store';
import { DictAttr } from './translatePopup';

// Define a type for the slice state
interface TranslatePopupState {
    dictAttr?: DictAttr;
}

// Define the initial state using that type
const initialState: TranslatePopupState = {};

export const translatePopupSlice = createSlice({
    name: 'translatePopup',
    initialState,
    reducers: {
        openAnkiExportPopup: (state, action: PayloadAction<DictAttr, string>) => {
            state.dictAttr = action.payload;
        }
    }
});

export const { openAnkiExportPopup } = translatePopupSlice.actions;

export const selectDictAttr = (state: RootState) => state.translatePopup.dictAttr;

const translatePopupReducer = translatePopupSlice.reducer;
export default translatePopupReducer;
