const API_BASE =
  process.env.LEETCODE_API_URL || "https://alfa-leetcode-api.onrender.com";

// Default timeout for API requests (10 seconds)
const REQUEST_TIMEOUT_MS = 10000;

/**
 * Helper: fetch with a timeout to avoid hanging requests.
 */
async function fetchWithTimeout(url, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch user profile data from LeetCode via alfa-leetcode-api.
 * Returns basic stats like total solved counts by difficulty.
 */
export async function fetchUserProfile(username) {
  try {
    const data = await fetchWithTimeout(`${API_BASE}/${username}/solved`);

    // The API returns an error message if the user doesn't exist
    if (data.errors || data.error) {
      throw new Error(`User "${username}" not found on LeetCode`);
    }

    return {
      username,
      totalSolved: data.solvedProblem || 0,
      easySolved: data.easySolved || 0,
      mediumSolved: data.mediumSolved || 0,
      hardSolved: data.hardSolved || 0,
    };
  } catch (error) {
    console.error(`Error fetching profile for ${username}:`, error.message);
    throw error;
  }
}

/**
 * Fetch recent accepted submissions from LeetCode via alfa-leetcode-api.
 * Returns up to 20 most recent accepted submissions, deduplicated by titleSlug.
 */
export async function fetchRecentSolvedProblems(username) {
  try {
    const data = await fetchWithTimeout(
      `${API_BASE}/${username}/acSubmission?limit=20`
    );

    const submissions = data.submission;

    if (!submissions || !Array.isArray(submissions)) {
      console.warn(`No submissions found for ${username}`);
      return [];
    }

    // Deduplicate by titleSlug (keep the most recent)
    const seen = new Set();
    const unique = [];

    for (const sub of submissions) {
      if (!seen.has(sub.titleSlug)) {
        seen.add(sub.titleSlug);
        unique.push({
          title: sub.title,
          titleSlug: sub.titleSlug,
          timestamp: sub.timestamp,
          lang: sub.lang,
        });
      }
    }

    return unique;
  } catch (error) {
    console.error(
      `Error fetching submissions for ${username}:`,
      error.message
    );
    throw error;
  }
}

/**
 * Fetch detailed problem info (difficulty, topic tags) for a given titleSlug.
 */
export async function fetchProblemDetails(titleSlug) {
  try {
    const data = await fetchWithTimeout(
      `${API_BASE}/select?titleSlug=${titleSlug}`
    );

    if (!data || data.errors) {
      return { difficulty: "Medium", topicTags: [] };
    }

    return {
      difficulty: data.difficulty || "Medium",
      topicTags:
        data.topicTags?.map((tag) => tag.name || tag.slug) || [],
    };
  } catch (error) {
    console.warn(
      `Could not fetch details for ${titleSlug}:`,
      error.message
    );
    return { difficulty: "Medium", topicTags: [] };
  }
}
