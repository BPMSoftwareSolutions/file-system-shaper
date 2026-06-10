export function extractPatternMatches(source, patterns) {
  const matches = [];

  for (const pattern of patterns) {
    const regex = new RegExp(pattern.regex, pattern.flags ?? "g");
    for (const match of source.matchAll(regex)) {
      if (!match[1]) continue;
      matches.push({
        kind: pattern.kind,
        specifier: match[1],
        start: match.index ?? 0,
        end: (match.index ?? 0) + match[0].length,
        full: match[0]
      });
    }
  }

  return matches;
}
