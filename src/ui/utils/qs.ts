export const encodeQS = (obj: Record<string, unknown>, prefix: string) => {
  const split: string[] = [];
  for (const p in obj) {
    if (obj[p]) {
      const k = prefix ? prefix + '[' + p + ']' : p;
      const v = obj[p];
      split.push(
        v !== null && typeof v === 'object'
          ? encodeQS(v as Record<string, unknown>, k)
          : encodeURIComponent(k) + '=' + encodeURIComponent(v as string)
      );
    }
  }
  return split.join('&');
};

export const decodeQs = (qs: string) => {
  const search = qs.startsWith('?') ? qs.substring(1) : qs;
  const urlParams = new URLSearchParams(search);
  const query = Object.fromEntries(urlParams.entries());
  return query;
};
