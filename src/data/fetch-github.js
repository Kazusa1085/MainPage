// GitHub data fetcher (build-time only)
import { fetchWithTimeout } from './fetch-utils.js';

export async function fetchRepos(githubUserUrl, count = 5, exclude = []) {
  if (!githubUserUrl) return [];
  try {
    const username = githubUserUrl.replace(/https?:\/\/github\.com\//, '').replace(/\/$/, '');
    const res = await fetchWithTimeout(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    if (!res.ok) return [];
    const repos = await res.json();
    return repos
      .filter(r => !r.fork && !exclude.some(e => r.name.includes(e)))
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, count)
      .map(r => ({
        name: r.name,
        description: r.description || '',
        url: r.html_url,
        stars: r.stargazers_count,
        language: r.language,
        topics: r.topics || [],
      }));
  } catch (e) {
    console.warn('GitHub fetch failed:', e.message);
    return [];
  }
}
