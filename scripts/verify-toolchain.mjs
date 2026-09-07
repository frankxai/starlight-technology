import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const manifest = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

function packageRootFromResolvedPath(resolvedPath, packageName) {
  let directory = dirname(resolvedPath);

  while (directory !== dirname(directory)) {
    const manifestPath = join(directory, "package.json");

    if (existsSync(manifestPath)) {
      const candidate = JSON.parse(readFileSync(manifestPath, "utf8"));

      if (candidate.name === packageName) {
        return { directory, manifest: candidate };
      }
    }

    directory = dirname(directory);
  }

  throw new Error(`Could not locate package.json for ${packageName}`);
}

function installedPackage(packageName, resolver = require) {
  return packageRootFromResolvedPath(resolver.resolve(packageName), packageName);
}

function major(version) {
  const match = /^(\d+)\./.exec(version);

  if (!match) {
    throw new Error(`Cannot parse semantic version "${version}"`);
  }

  return Number(match[1]);
}

const nextPackage = installedPackage("next");
const nextLintPackage = installedPackage("eslint-config-next");
const eslintPackage = installedPackage("eslint");
const typescriptPackage = installedPackage("typescript");
const nextLintRequire = createRequire(
  pathToFileURL(join(nextLintPackage.directory, "package.json")),
);
const typescriptEslintPackage = installedPackage(
  "typescript-eslint",
  nextLintRequire,
);

const versions = {
  node: process.versions.node,
  next: nextPackage.manifest.version,
  "eslint-config-next": nextLintPackage.manifest.version,
  eslint: eslintPackage.manifest.version,
  typescript: typescriptPackage.manifest.version,
  "typescript-eslint": typescriptEslintPackage.manifest.version,
};

const approvedMajors = {
  node: [24],
  next: [16],
  "eslint-config-next": [16],
  eslint: [9],
  typescript: [5, 6],
  "typescript-eslint": [8],
};

const failures = [];

for (const [name, allowedMajors] of Object.entries(approvedMajors)) {
  const installedMajor = major(versions[name]);

  if (!allowedMajors.includes(installedMajor)) {
    failures.push(
      `${name}@${versions[name]} is outside approved majors ${allowedMajors.join(", ")}`,
    );
  }
}

if (major(versions.next) !== major(versions["eslint-config-next"])) {
  failures.push(
    `next@${versions.next} and eslint-config-next@${versions["eslint-config-next"]} must share a major`,
  );
}

for (const [name, declaredVersion] of [
  ["next", manifest.dependencies.next],
  ["eslint", manifest.devDependencies.eslint],
  ["eslint-config-next", manifest.devDependencies["eslint-config-next"]],
  ["typescript", manifest.devDependencies.typescript],
]) {
  if (declaredVersion !== versions[name]) {
    failures.push(
      `${name} must be exactly pinned: package.json declares ${declaredVersion}, installed ${versions[name]}`,
    );
  }
}

if (failures.length > 0) {
  console.error("Unsupported Starlight Technology toolchain:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error(
    "Change the approved matrix only in a reviewed compatibility PR. TypeScript 7 is tracked in #8.",
  );
  process.exit(1);
}

console.log(
  `Toolchain compatible: ${Object.entries(versions)
    .map(([name, version]) => `${name}@${version}`)
    .join(", ")}`,
);
