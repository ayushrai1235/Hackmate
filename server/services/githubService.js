import axios from 'axios';

/**
 * Fetches user contribution count from REST Events or GraphQL API
 */
const fetchContributions = async (username, headers) => {
  // Check if a GITHUB_TOKEN or GITHUB_PAT exists in the environment for GraphQL queries
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
  if (token) {
    try {
      const query = `
        query($login: String!) {
          user(login: $login) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
              }
            }
          }
        }
      `;
      const gqlRes = await axios.post(
        'https://api.github.com/graphql',
        { query, variables: { login: username } },
        { headers: { Authorization: `bearer ${token}` } }
      );
      const total = gqlRes.data?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions;
      if (total !== undefined) {
        return total;
      }
    } catch (err) {
      console.warn('GraphQL contributions fetch failed, falling back to REST events:', err.message);
    }
  }

  // Fallback: Fetch public user events via REST
  try {
    const eventsRes = await axios.get(
      `https://api.github.com/users/${username}/events?per_page=100`,
      { headers }
    );
    const events = eventsRes.data || [];
    let count = 0;
    events.forEach((event) => {
      if (event.type === 'PushEvent') {
        count += event.payload?.commits?.length || 1;
      } else if (
        [
          'PullRequestEvent',
          'IssuesEvent',
          'IssueCommentEvent',
          'PullRequestReviewEvent',
          'CreateEvent',
        ].includes(event.type)
      ) {
        count += 1;
      }
    });
    return count;
  } catch (err) {
    console.error('REST events fetch failed:', err.message);
    return 0;
  }
};

/**
 * Main Service to retrieve GitHub data and compute the GitHub Score
 */
export const getGitHubStats = async (username) => {
  if (!username) return null;

  try {
    const headers = {
      'User-Agent': 'HackMate-AI-Service',
    };

    // Authenticate with Client ID/Secret if available to avoid rate limit issues
    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
      const auth = Buffer.from(
        `${process.env.GITHUB_CLIENT_ID}:${process.env.GITHUB_CLIENT_SECRET}`
      ).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

    // 1. Fetch user profile
    const userRes = await axios.get(`https://api.github.com/users/${username}`, { headers });
    const profile = userRes.data;

    // 2. Fetch user repositories (max 100)
    const reposRes = await axios.get(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      { headers }
    );
    const repos = reposRes.data || [];

    // Calculate total stars
    let totalStars = 0;
    repos.forEach((repo) => {
      totalStars += repo.stargazers_count || 0;
    });

    // 3. Get language bytes for top 10 repositories (by size) to optimize requests
    const sortedRepos = [...repos]
      .sort((a, b) => (b.size || 0) - (a.size || 0))
      .slice(0, 10);

    const languageBytes = {};
    const languageRequests = sortedRepos.map((repo) =>
      axios
        .get(`https://api.github.com/repos/${username}/${repo.name}/languages`, { headers })
        .then((res) => res.data)
        .catch((err) => {
          console.warn(`Failed to fetch languages for repo ${repo.name}:`, err.message);
          return {};
        })
    );

    const languagesResults = await Promise.all(languageRequests);
    languagesResults.forEach((repoLangs) => {
      for (const [lang, bytes] of Object.entries(repoLangs)) {
        languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
      }
    });

    // Compute proficiency levels based on total byte percentage
    const totalBytes = Object.values(languageBytes).reduce((a, b) => a + b, 0);
    const languages = {};

    if (totalBytes > 0) {
      for (const [lang, bytes] of Object.entries(languageBytes)) {
        const percentage = (bytes / totalBytes) * 100;
        let level = 'Beginner';
        if (percentage >= 50) {
          level = 'Advanced';
        } else if (percentage >= 15) {
          level = 'Intermediate';
        }
        languages[lang] = level;
      }
    } else {
      // Fallback: If no byte breakdowns, map primary languages from repos list to Beginner
      repos.forEach((repo) => {
        if (repo.language && !languages[repo.language]) {
          languages[repo.language] = 'Beginner';
        }
      });
    }

    // 4. Fetch contribution count
    const contributions = await fetchContributions(username, headers);

    const reposCount = profile.public_repos || 0;

    // 5. Calculate githubScore (0-100)
    // - Repos: up to 30 pts (log scale)
    const reposScore =
      reposCount > 0
        ? Math.min(30, Math.round(30 * (Math.log(reposCount + 1) / Math.log(50))))
        : 0;

    // - Stars: up to 25 pts (log scale)
    const starsScore =
      totalStars > 0
        ? Math.min(25, Math.round(25 * (Math.log(totalStars + 1) / Math.log(25))))
        : 0;

    // - Contributions: up to 25 pts (log scale)
    const contribsScore =
      contributions > 0
        ? Math.min(25, Math.round(25 * (Math.log(contributions + 1) / Math.log(100))))
        : 0;

    // - Language diversity: up to 20 pts (4 pts per unique language)
    const uniqueLangs = Object.keys(languages).length;
    const langDiversityScore = Math.min(20, uniqueLangs * 4);

    const githubScore = Math.min(
      100,
      Math.round(reposScore + starsScore + contribsScore + langDiversityScore)
    );

    return {
      username,
      repos: reposCount,
      stars: totalStars,
      languages,
      contributions,
      githubScore,
    };
  } catch (error) {
    console.error(`Error in githubService for user ${username}:`, error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
};
