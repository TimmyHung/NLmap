import { combineReducers } from '@reduxjs/toolkit';
import githubReducer from '../slices/githubSlice';

const rootReducer = combineReducers({
  github: githubReducer,
});

export default rootReducer;
