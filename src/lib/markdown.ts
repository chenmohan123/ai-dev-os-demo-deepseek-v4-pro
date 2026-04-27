interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function getTOCItems(markdown: string): TOCItem[] {
  const lines = markdown.split('\n');
  const items: TOCItem[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[`*_~\[\]]/g, '');
      const id = text
        .toLowerCase()
        .replace(/[\s]+/g, '-')
        .replace(/[^\w\-]+/g, '');
      items.push({ id, text, level });
    }
  }

  return items;
}
