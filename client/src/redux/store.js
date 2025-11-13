import { configureStore } from "@reduxjs/toolkit";
import favoriteReducer from "./slices/favoriteSlice";

export default configureStore({
  reducer: {
    favorites: favoriteReducer,
  },
});
