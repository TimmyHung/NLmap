import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRequest } from "@/components/lib/API";

export const fetchCommits = createAsyncThunk('github/fetchCommits', async () => {
  const response = await getRequest("api/gitCommit", {}, {}, 10000);
  if (response.status) {
    return response.commit;
  } else {
    throw new Error('Failed to fetch commits');
  }
});

const githubSlice = createSlice({
  name: 'github',
  initialState: {
    commits: [],
    isDataLoading: true,
    isLoaded: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommits.pending, (state) => {
        state.isDataLoading = true;
      })
      .addCase(fetchCommits.fulfilled, (state, action) => {
        state.commits = action.payload;
        state.isDataLoading = false;
        state.isLoaded = true;
      })
      .addCase(fetchCommits.rejected, (state) => {
        state.isDataLoading = false;
      });
  }
});

export default githubSlice.reducer;
