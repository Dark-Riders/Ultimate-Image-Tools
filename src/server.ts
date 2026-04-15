import sharp from "sharp";
import JSZip from "jszip";
import { join, basename, extname } from "path";

const PORT = 19683;

// --- Serve static files from public/ ---
async function serveStatic(path: string): Promise<Response> {
    const filePath = join(import.meta.dir, "..", "public", path === "/" ? "index.html" : path);
    const file = Bun.file(filePath);
    if (await file.exists()) {
        return new Response(file, {
            headers: {
                // Required for SharedArrayBuffer (ONNX WASM multi-threading in BG Remover)
                "Cross-Origin-Opener-Policy": "same-origin",
                "Cross-Origin-Embedder-Policy": "credentialless",
            },
        });
    }
    return new Response("Not found", { status: 404 });
}

// --- API: Generate preview ---
async function handlePreview(req: Request): Promise<Response> {
    try {
        const formData = await req.formData();
        const imageFile = formData.get("image") as File | null;
        const watermarkFile = formData.get("watermark") as File | null;

        if (!imageFile || !watermarkFile) {
            return Response.json({ error: "Missing image or watermark" }, { status: 400 });
        }

        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        const wmBuffer = Buffer.from(await watermarkFile.arrayBuffer());
        const minSizeStr = formData.get("minSize") as string | null;
        const minSize = minSizeStr ? parseInt(minSizeStr, 10) : 0;

        const metadata = await sharp(imageBuffer).metadata();
        let { width, height } = metadata;

        if (!width || !height) {
            return Response.json({ error: "Could not read image dimensions" }, { status: 400 });
        }

        // Upscale if smaller than minSize
        let imgBuf = imageBuffer;
        if (minSize > 0 && (width < minSize || height < minSize)) {
            const scale = minSize / Math.min(width, height);
            const newW = Math.round(width * scale);
            const newH = Math.round(height * scale);
            imgBuf = await sharp(imageBuffer).resize(newW, newH, { fit: "fill" }).toBuffer() as Buffer<ArrayBuffer>;
            width = newW;
            height = newH;
        }

        const resizedWm = await sharp(wmBuffer)
            .resize(width, height, { fit: "fill" })
            .ensureAlpha()
            .toBuffer();

        const outputFormat = (formData.get("outputFormat") as string) || "png";
        const outputQuality = parseInt((formData.get("outputQuality") as string) || "85", 10);

        let pipeline = sharp(imgBuf)
            .ensureAlpha()
            .composite([{ input: resizedWm, blend: "over" }]);

        let result: Buffer;
        let contentType: string;
        if (outputFormat === 'jpeg') {
            result = await pipeline.jpeg({ quality: outputQuality }).toBuffer();
            contentType = 'image/jpeg';
        } else if (outputFormat === 'webp') {
            result = await pipeline.webp({ quality: outputQuality }).toBuffer();
            contentType = 'image/webp';
        } else {
            result = await pipeline.png().toBuffer();
            contentType = 'image/png';
        }

        return new Response(new Uint8Array(result), {
            headers: { "Content-Type": contentType },
        });
    } catch (err) {
        return Response.json(
            { error: err instanceof Error ? err.message : "Preview failed" },
            { status: 500 }
        );
    }
}

// --- API: Bulk process → returns ZIP ---
async function handleProcess(req: Request): Promise<Response> {
    try {
        const formData = await req.formData();

        // Collect images and watermarks
        const images: { name: string; buffer: Buffer; relativePath: string }[] = [];
        const watermarks: { name: string; buffer: Buffer }[] = [];
        const paths: Map<number, string> = new Map();

        // First pass: collect paths
        for (const [key, value] of formData.entries()) {
            if (key.startsWith("paths_") && typeof value === "string") {
                const idx = parseInt(key.replace("paths_", ""), 10);
                paths.set(idx, value);
            }
        }

        // Second pass: collect files
        let imgIdx = 0;
        for (const [key, value] of formData.entries()) {
            if (key.startsWith("images_") && typeof value === "object" && value !== null && "arrayBuffer" in value) {
                const f = value as File;
                const relPath = paths.get(imgIdx) || f.name;
                images.push({
                    name: f.name,
                    buffer: Buffer.from(await f.arrayBuffer()),
                    relativePath: relPath,
                });
                imgIdx++;
            }
            if (key.startsWith("watermarks_") && typeof value === "object" && value !== null && "arrayBuffer" in value) {
                const f = value as File;
                watermarks.push({
                    name: f.name,
                    buffer: Buffer.from(await f.arrayBuffer()),
                });
            }
        }

        if (images.length === 0 || watermarks.length === 0) {
            return Response.json({ error: "No images or watermarks provided" }, { status: 400 });
        }

        // Get minSize from formData
        const minSizeStr = formData.get("minSize") as string | null;
        const minSize = minSizeStr ? parseInt(minSizeStr, 10) : 0;

        // Get output format/quality
        const outputFormat = (formData.get("outputFormat") as string) || "png";
        const outputQuality = parseInt((formData.get("outputQuality") as string) || "85", 10);
        const outExt = outputFormat === 'jpeg' ? '.jpg' : outputFormat === 'webp' ? '.webp' : '.png';

        console.log(`Processing ${images.length} images × ${watermarks.length} watermark(s)...${minSize ? ` (min size: ${minSize}px)` : ''} [${outputFormat.toUpperCase()}${outputFormat !== 'png' ? ` q${outputQuality}` : ''}]`);

        // Build ZIP using JSZip (fully in-memory, no streams)
        const zip = new JSZip();

        for (const wm of watermarks) {
            const wmName = basename(wm.name, extname(wm.name));

            for (const img of images) {
                try {
                    const metadata = await sharp(img.buffer).metadata();
                    let { width, height } = metadata;
                    if (!width || !height) continue;

                    // Upscale if smaller than minSize
                    let imgBuf = img.buffer;
                    if (minSize > 0 && (width < minSize || height < minSize)) {
                        const scale = minSize / Math.min(width, height);
                        const newW = Math.round(width * scale);
                        const newH = Math.round(height * scale);
                        imgBuf = await sharp(img.buffer).resize(newW, newH, { fit: "fill" }).toBuffer();
                        width = newW;
                        height = newH;
                    }

                    const resizedWm = await sharp(wm.buffer)
                        .resize(width, height, { fit: "fill" })
                        .ensureAlpha()
                        .toBuffer();

                    let pipeline = sharp(imgBuf)
                        .ensureAlpha()
                        .composite([{ input: resizedWm, blend: "over" }]);

                    let result: Buffer;
                    if (outputFormat === 'jpeg') {
                        result = await pipeline.jpeg({ quality: outputQuality }).toBuffer();
                    } else if (outputFormat === 'webp') {
                        result = await pipeline.webp({ quality: outputQuality }).toBuffer();
                    } else {
                        result = await pipeline.png().toBuffer();
                    }

                    // Build ZIP path
                    const outputFileName = basename(img.name, extname(img.name)) + outExt;

                    const relDir = img.relativePath.includes("/")
                        ? img.relativePath.substring(0, img.relativePath.lastIndexOf("/"))
                        : "";

                    const zipPath = relDir
                        ? `${wmName}/${relDir}/${outputFileName}`
                        : `${wmName}/${outputFileName}`;

                    zip.file(zipPath, result);
                    console.log(`  ✓ ${zipPath}`);
                } catch (err) {
                    console.error(`  ✗ ${img.relativePath} — ${err instanceof Error ? err.message : err}`);
                }
            }
        }

        console.log("Generating ZIP...");
        const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 5 } });
        console.log(`Done! ZIP size: ${(zipBuffer.length / 1024 / 1024).toFixed(1)} MB`);

        return new Response(new Uint8Array(zipBuffer) as unknown as BodyInit, {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="watermarked.zip"`,
                "Content-Length": String(zipBuffer.length),
            },
        });
    } catch (err) {
        console.error("Process error:", err);
        return Response.json(
            { error: err instanceof Error ? err.message : "Processing failed" },
            { status: 500 }
        );
    }
}

// --- Server ---
const server = Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);

        if (url.pathname === "/api/preview" && req.method === "POST") {
            return handlePreview(req);
        }
        if (url.pathname === "/api/process" && req.method === "POST") {
            return handleProcess(req);
        }

        return serveStatic(url.pathname);
    },
});

console.log(`\n🖼️  Watermark Applier GUI running at http://localhost:${PORT}\n`);
