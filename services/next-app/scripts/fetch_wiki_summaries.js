const fetch = require("node-fetch");
const fs    = require("fs");
const path  = require("path");

// Load list of regions
const regions = fs
  .readFileSync(path.join(__dirname, "../public/data/regions.csv"), "utf8")
  .trim()
  .split("\n")
  .slice(1)            // drop header
  .map(id => id.trim())  // remove any whitespace/carriage returns
  .filter(Boolean);

// Convert a regionId into a Wikipedia page title
function toWikiTitle(id) {  let title = id
    .replace(/_[LR]$/i, "")       // remove trailing _L or _R first
    .replace(/\s*[LR]\s*$/i, "")  // handle cases with space before L/R
    .replace(/_/g, " ")           // then convert remaining underscores → spaces 
    .replace(/\s*\(.*?\)$/, "")   // drop any parentheses with content
    .trim();

  // Capitalize first letter of each word for consistency
  title = title
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return title;
}

// Try to fetch a summary directly
async function fetchSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url, { headers: { "User-Agent": "Neuranaut/1.0" } });
  if (res.ok) {
    const json = await res.json();
    return { extract: json.extract, title: json.title };
  }
  return null;
}

// If direct lookup fails, use the Opensearch API for a suggestion
async function findBestTitle(query) {
  const api = `https://en.wikipedia.org/w/api.php?action=opensearch&limit=1&namespace=0&format=json&origin=*&search=${encodeURIComponent(query)}`;
  const res = await fetch(api);
  if (!res.ok) return null;
  const json = await res.json();
  return json[1][0] || null;  // first suggestion
}

(async () => {
  const out = {};

  for (const regionId of regions) {
    const guess = toWikiTitle(regionId);
    let page = await fetchSummary(guess);

    // fallback to search
    if (!page) {
      console.warn(`⚠️ Direct lookup failed for “${guess}”; trying search…`);
      const suggestion = await findBestTitle(guess);
      if (suggestion) {
        page = await fetchSummary(suggestion);
        if (!page) {
          console.warn(`  ❌ Summary still missing for “${suggestion}”`);
        } else {
          console.log(`  🔍 Found via search: “${suggestion}”`);
        }
      } else {
        console.warn(`  ❌ No search suggestions for “${guess}”`);
      }
    }

    out[regionId] = {
      name: page?.title   || guess,
      desc: page?.extract || "",
      refs: page
        ? [`https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`]
        : []
    };

    // small delay to avoid hammering the API
    await new Promise(res => setTimeout(res, 300));
  }

  fs.writeFileSync(
    path.join(__dirname, "../public/data/regions.json"),
    JSON.stringify(out, null, 2),
    "utf8"
  );
  console.log(`✅ Wrote ${Object.keys(out).length} entries to public/data/regions.json`);
})();
