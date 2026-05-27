const fs = require("fs");

const sourceUrl =
  "https://raw.githubusercontent.com/mihomo-party-org/override-hub/main/yaml/%E5%B8%83%E4%B8%81%E7%8B%97%E7%9A%84%E8%AE%A2%E9%98%85%E8%BD%AC%E6%8D%A2.yaml";

const outputPath = "dist/buding-subscription-convert.stoverride";
const proxyChoices = ["AUTO", "HK AUTO", "SG AUTO", "JP AUTO", "US AUTO", "ALL"];

function addReplaceMarkers(yaml) {
  return yaml
    .replace(/^rule-providers:\s*$/m, "rule-providers: #!replace")
    .replace(/^proxy-groups:\s*$/m, "proxy-groups: #!replace")
    .replace(/^rules:\s*$/m, "rules: #!replace");
}

function rewriteProxyGroupForStash(yaml) {
  const lines = yaml.split("\n");
  const proxyGroupsIndex = lines.findIndex((line) => /^proxy-groups:\s*(#!replace)?\s*$/.test(line));

  if (proxyGroupsIndex === -1) {
    return yaml;
  }

  let sectionEnd = lines.length;

  for (let i = proxyGroupsIndex + 1; i < lines.length; i += 1) {
    if (/^\S[^:]*:\s*/.test(lines[i])) {
      sectionEnd = i;
      break;
    }
  }

  let proxyGroupStart = -1;
  let proxyGroupEnd = -1;

  for (let i = proxyGroupsIndex + 1; i < sectionEnd; i += 1) {
    const groupStartMatch = lines[i].match(/^(\s*)-\s+/);

    if (!groupStartMatch) {
      continue;
    }

    const currentGroupIndent = groupStartMatch[1];
    let end = sectionEnd;

    for (let j = i + 1; j < sectionEnd; j += 1) {
      if (lines[j].startsWith(`${currentGroupIndent}- `)) {
        end = j;
        break;
      }
    }

    const groupLines = lines.slice(i, end);

    if (groupLines.some((line) => /^\s*name:\s*PROXY\s*$/.test(line))) {
      proxyGroupStart = i;
      proxyGroupEnd = end;
      break;
    }
  }

  if (proxyGroupStart === -1) {
    return yaml;
  }

  const groupLines = lines.slice(proxyGroupStart, proxyGroupEnd);
  const groupIndent = groupLines[0].match(/^(\s*)-\s+/)[1];
  const fieldIndent = `${groupIndent}  `;
  const itemIndent = `${fieldIndent}  `;
  const iconLine = groupLines.find((line) => /^\s*-\s*icon:\s*/.test(line) || /^\s*icon:\s*/.test(line));
  const excludeFilterLine = groupLines.find((line) => /^\s*exclude-filter:\s*/.test(line));
  const iconValue = iconLine ? iconLine.replace(/^\s*-\s*icon:\s*|^\s*icon:\s*/, "") : "";
  const excludeFilterValue = excludeFilterLine
    ? excludeFilterLine.replace(/^\s*exclude-filter:\s*/, "")
    : "";

  const replacement = [
    iconValue ? `${groupIndent}- icon: ${iconValue}` : `${groupIndent}- name: PROXY`,
    iconValue ? `${fieldIndent}name: PROXY` : null,
    `${fieldIndent}type: select`,
    `${fieldIndent}proxies:`,
    ...proxyChoices.map((choice) => `${itemIndent}- ${choice}`),
    iconValue ? `${groupIndent}- icon: ${iconValue}` : `${groupIndent}- name: ALL`,
    iconValue ? `${fieldIndent}name: ALL` : null,
    `${fieldIndent}type: select`,
    `${fieldIndent}include-all: true`,
    excludeFilterValue ? `${fieldIndent}exclude-filter: ${excludeFilterValue}` : null,
  ].filter(Boolean);

  lines.splice(proxyGroupStart, proxyGroupEnd - proxyGroupStart, ...replacement);

  return lines.join("\n");
}

async function main() {
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch source YAML: ${response.status}`);
  }

  const yaml = await response.text();
  const converted = addReplaceMarkers(rewriteProxyGroupForStash(yaml));

  fs.mkdirSync("dist", { recursive: true });
  fs.writeFileSync(outputPath, converted);

  console.log(`Generated ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
