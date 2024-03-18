import { defineConfig } from "tsup";
import glob from "tiny-glob";

export default defineConfig(async () => {
    return {
        entry: await glob('./src/**/!(*.d|*.spec).ts'),
        format: ["cjs", "esm"], // Build for commonJS and ESmodules
        dts: true, // Generate declaration file (.d.ts)
        splitting: true,
        sourcemap: true,
        clean: true,
    }
});