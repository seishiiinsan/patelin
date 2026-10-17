import { htmlToText } from "@/lib/wikimedia";
import { fetchJson } from "./http";

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const WIKIDATA_SPARQL = "https://query.wikidata.org/sparql";

export const THUMB_WIDTH = 640;

// The Commons API accepts at most 50 titles per query.
export const COMMONS_BATCH = 50;

export type ImageInfo = {
  thumbUrl: string;
  author: string | null;
  license: string | null;
  licenseUrl: string | null;
};

type RawImageInfo = {
  thumburl?: string;
  url: string;
  extmetadata?: Record<string, { value: string } | undefined>;
};

type ImageInfoResponse = {
  query?: {
    normalized?: { from: string; to: string }[];
    pages: { title: string; missing?: boolean; imageinfo?: RawImageInfo[] }[];
  };
};

// Commons appends utm_* tracking parameters to thumbnail URLs; the image is the same without.
function withoutQuery(url: string): string {
  const parsed = new URL(url);
  parsed.search = "";
  return parsed.toString();
}

function toImageInfo(info: RawImageInfo): ImageInfo {
  const meta = info.extmetadata ?? {};
  const read = (key: string) => {
    const value = meta[key]?.value;
    return value ? htmlToText(value) : null;
  };
  return {
    thumbUrl: withoutQuery(info.thumburl ?? info.url),
    author: read("Artist"),
    license: read("LicenseShortName"),
    licenseUrl: meta.LicenseUrl?.value ?? null,
  };
}

async function commonsQuery<T>(params: Record<string, string>): Promise<T> {
  const body = new URLSearchParams({
    format: "json",
    formatversion: "2",
    maxlag: "5",
    ...params,
  });
  return fetchJson<T>(COMMONS_API, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

// Thumbnail URL and credits for up to 50 files ("Name.jpg", without the "File:" prefix).
// Files missing on Commons are absent from the returned map.
export async function fetchImageInfo(
  fileNames: string[],
): Promise<Map<string, ImageInfo>> {
  const data = await commonsQuery<ImageInfoResponse>({
    action: "query",
    titles: fileNames.map((name) => `File:${name}`).join("|"),
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: String(THUMB_WIDTH),
    iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl",
  });

  const byTitle = new Map(
    (data.query?.pages ?? []).map((page) => [page.title, page]),
  );
  const normalized = new Map(
    (data.query?.normalized ?? []).map((n) => [n.from, n.to]),
  );
  const result = new Map<string, ImageInfo>();

  for (const name of fileNames) {
    const sent = `File:${name}`;
    const page = byTitle.get(normalized.get(sent) ?? sent);
    const info = page?.imageinfo?.[0];
    if (!page || page.missing || !info) continue;
    result.set(name, toImageInfo(info));
  }
  return result;
}

type CategoryInfoResponse = {
  query?: {
    normalized?: { from: string; to: string }[];
    pages: {
      title: string;
      missing?: boolean;
      categoryinfo?: { files: number };
    }[];
  };
};

// Number of files directly in each category (titles with the "Category:" prefix); 0 when missing.
export async function fetchCategoryFileCounts(
  titles: string[],
): Promise<Map<string, number>> {
  const data = await commonsQuery<CategoryInfoResponse>({
    action: "query",
    titles: titles.join("|"),
    prop: "categoryinfo",
  });
  const byTitle = new Map(
    (data.query?.pages ?? []).map((page) => [page.title, page]),
  );
  const normalized = new Map(
    (data.query?.normalized ?? []).map((n) => [n.from, n.to]),
  );
  return new Map(
    titles.map((title) => {
      const page = byTitle.get(normalized.get(title) ?? title);
      return [title, page?.categoryinfo?.files ?? 0];
    }),
  );
}

// Thumbnail and credits of the first files of a category, in one request.
export async function fetchCategoryImages(
  category: string,
  limit: number,
): Promise<{ file: string; info: ImageInfo }[]> {
  const data = await commonsQuery<ImageInfoResponse>({
    action: "query",
    generator: "categorymembers",
    gcmtitle: category,
    gcmtype: "file",
    gcmlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: String(THUMB_WIDTH),
    iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl",
  });
  return (data.query?.pages ?? []).flatMap((page) => {
    const info = page.imageinfo?.[0];
    return info
      ? [{ file: page.title.replace(/^File:/, ""), info: toImageInfo(info) }]
      : [];
  });
}

type SparqlResponse<K extends string> = {
  results: { bindings: Record<K, { value: string } | undefined>[] };
};

export async function sparql<K extends string>(query: string) {
  const data = await fetchJson<SparqlResponse<K>>(WIKIDATA_SPARQL, {
    method: "POST",
    body: new URLSearchParams({ query }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/sparql-results+json",
    },
  });
  return data.results.bindings;
}

// Runs `task` on every item with at most `concurrency` calls in flight.
export async function forEachConcurrent<T>(
  items: T[],
  concurrency: number,
  task: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (next < items.length) {
      const item = items[next++]!;
      await task(item);
    }
  });
  await Promise.all(workers);
}
