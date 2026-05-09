// Download BG Removal model files for offline use.
// Run: bun run scripts/download-models.ts [--all]
// Default: downloads quint8 model + WASM only (~75MB)
// --all: downloads all models (~330MB)

import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const CDN_BASE = "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/";
const OUT_DIR = join(import.meta.dir, "..", "public", "models");

const downloadAll = process.argv.includes("--all");

async function main() {
    console.log("\n🧠 Background Removal — Offline Model Downloader\n");

    // Create output dir
    if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

    // Fetch resources.json
    console.log("📋 Fetching resources.json...");
    const res = await fetch(CDN_BASE + "resources.json");
    if (!res.ok) throw new Error(`Failed to fetch resources.json: ${res.status}`);
    const resources = await res.json() as Record<string, { chunks: { hash: string; name: string }[]; size: number }>;

    // Save resources.json
    await Bun.write(join(OUT_DIR, "resources.json"), JSON.stringify(resources));
    console.log("  ✅ resources.json saved\n");

    // Determine which resources to download
    const skipModels = downloadAll ? [] : ["isnet", "isnet_fp16"];
    const entries = Object.entries(resources).filter(([key]) => {
        const modelName = key.replace("/models/", "");
        if (skipModels.includes(modelName)) {
            console.log(`  ⏭️  Skipping ${key} (use --all to include)`);
            return false;
        }
        return true;
    });

    // Count total chunks
    const totalChunks = entries.reduce((sum, [, r]) => sum + r.chunks.length, 0);
    const totalSizeMB = entries.reduce((sum, [, r]) => sum + r.size, 0) / (1024 * 1024);
    console.log(`\n📦 Downloading ${totalChunks} chunks (${totalSizeMB.toFixed(1)} MB)...\n`);

    let downloaded = 0;
    for (const [key, resource] of entries) {
        console.log(`  📂 ${key} (${(resource.size / 1024 / 1024).toFixed(1)} MB, ${resource.chunks.length} chunks)`);
        for (const chunk of resource.chunks) {
            const outPath = join(OUT_DIR, chunk.name);
            if (existsSync(outPath)) {
                downloaded++;
                continue; // Already downloaded
            }
            const url = CDN_BASE + chunk.name;
            const resp = await fetch(url);
            if (!resp.ok) {
                console.error(`     ❌ Failed: ${chunk.name} (${resp.status})`);
                continue;
            }
            const data = await resp.arrayBuffer();
            await Bun.write(outPath, data);
            downloaded++;
            const pct = ((downloaded / totalChunks) * 100).toFixed(0);
            process.stdout.write(`     ${pct}% (${downloaded}/${totalChunks})\r`);
        }
        console.log(`     ✅ Done`);
    }

    console.log(`\n✅ All files downloaded to public/models/`);
    console.log(`   Total: ${totalSizeMB.toFixed(1)} MB\n`);
}

main().catch(err => {
    console.error("❌ Download failed:", err.message);
    process.exit(1);
});
