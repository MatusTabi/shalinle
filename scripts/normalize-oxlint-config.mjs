import { readFile, rm, writeFile } from "node:fs/promises";

const path = ".oxlintrc.json";
const config = JSON.parse(await readFile(path, "utf8"));

for (const override of config.overrides ?? []) {
    if (override.files?.length === 1 && override.files[0] === null) {
        // @oxlint/migrate cannot represent FlatCompat's global override predicate.
        override.files = ["**/*.{js,jsx,mjs,cjs,ts,tsx}"];
    }
}

await writeFile(path, `${JSON.stringify(config, null, 2)}\n`);
await rm(`${path}.bak`, { force: true });
