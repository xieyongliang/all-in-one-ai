import { createSlice } from "@reduxjs/toolkit";

export const Slice = createSlice({
    name: "userGroup",
    initialState: {
        value: "",
    },
    reducers: {
        changeUserGroup: (state, action) => {
            state.value = action.payload;
        },
    },
});

export const selectUserGroup = (state) => state.userGroup.value;

export const { changeUserGroup } = Slice.actions;
export default Slice.reducer;
