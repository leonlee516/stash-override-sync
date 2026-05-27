const fs = require("fs");

const sourceUrl =
  "https://raw.githubusercontent.com/mihomo-party-org/override-hub/main/yaml/%E5%B8%83%E4%B8%81%E7%8B%97%E7%9A%84%E8%AE%A2%E9%98%85%E8%BD%AC%E6%8D%A2.yaml";

const outputPath = "dist/buding-subscription-convert.stoverride";

function addReplaceMarkers(yaml) {
  return yaml
    .replace(/^rule-providers:\s*$/m, "rule-providers: #!replace")
    .replace(/^proxy-groups:\s*$/m, "proxy-groups: #!replace")
    .replace(/^rules:\s*$/m, "rules: #!replace");
}

async function main() {
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch source YAML: ${response.status}`);
  }

  const yaml = await response.text();
  const converted = addReplaceMarkers(yaml);

  fs.mkdirSync("dist", { recursive: true });
  fs.writeFileSync(outputPath, converted);

  console.log(`Generated ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
