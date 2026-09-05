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

export async function fetchContributions(githubUserUrl) {
  if (!githubUserUrl) return [];
  const username = githubUserUrl.replace(/https?:\/\/github\.com\//, '').replace(/\/$/, '');
  try {
    const res = await fetchWithTimeout(`https://github.com/users/${username}/contributions`);
    if (!res.ok) return [];
    const html = await res.text();
    const days = [];
    const rectRegex = /<rect[^>]*data-count="(\d+)"[^>]*data-date="([^"]+)"/g;
    let match;
    while ((match = rectRegex.exec(html)) !== null) {
      days.push({ date: match[2], count: parseInt(match[1], 10) });
    }
    return days;
  } catch {
    return [];
  }
}
