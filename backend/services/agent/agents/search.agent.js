import { searchTool } from "../config/tavily.js";
 
const MAX_RESULTS = 4;
const MAX_CONTENT_CHARS = 400;
const MAX_IMAGES = 4;

function slimResults(rawResults) {
  const list = Array.isArray(rawResults?.results) ? rawResults.results : [];
  return list.slice(0, MAX_RESULTS).map((r) => ({
    title: r.title,
    url: r.url,
    content: (r.content || "").slice(0, MAX_CONTENT_CHARS),
  }));
}

export const searchAgent = async (state) => {
  try {
    const rawResults = await searchTool.invoke({
      query: state.prompt,
    });
 
    if (!rawResults || rawResults.error) {
      return { ...state, searchResults: [], images: [] };
    }

    return {
      ...state,
      searchResults: slimResults(rawResults),
      images: (rawResults.images || []).slice(0, MAX_IMAGES),
    };
  } catch (error) {
    return {
      ...state,
      searchResults: [],
      images: [],
    };
  }
};
