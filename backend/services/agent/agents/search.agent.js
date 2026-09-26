import { searchTool } from "../config/tavily";

export const searchAgent = async (params) => {
  try {
    const results = await searchTool.invoke({
      query: state.prompt,
    });
    return {
      ...state,
      searchResults: results,
      images: results.images,
    };
  } catch (error) {
    return {
      ...state,
      searchResults: [],
      images: [],
    };
  }
};
