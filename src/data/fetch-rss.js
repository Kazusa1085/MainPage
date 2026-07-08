// RSS feed fetcher (build-time only)

export async function fetchArticles(rssUrl, count = 4) {
  if (!rssUrl) return [];
  try {
    const res = await fetch(rssUrl);
    const xml = await res.text();
    const items = [];

    // Match <item>...</item> blocks
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < count) {
      const item = match[1];
      const title = extractXml(item, 'title');
      const link = extractXml(item, 'link');
      const desc = extractXml(item, 'description') || extractXml(item, 'content:encoded') || '';
      const pubDate = extractXml(item, 'pubDate') || extractXml(item, 'dc:date');
      items.push({
        title: title || 'Untitled',
        link: link || '#',
        description: stripHtml(desc).slice(0, 100),
        date: pubDate ? formatDate(pubDate) : '',
      });
    }
    return items;
  } catch (e) {
    console.warn('RSS fetch failed:', e.message);
    return [];
  }
}

function extractXml(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = xml.match(regex);
  return m ? m[1].trim() : '';
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  } catch { return dateStr; }
}
