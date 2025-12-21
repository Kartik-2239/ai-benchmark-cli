import { serve } from "bun";
import { readdir } from "fs/promises";
import { join } from "path";
import index from "./index.html";

const CACHE_DIR = join(import.meta.dir, "../../cache");

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    // List all cache files
    "/api/cache": {
      async GET() {
        try {
          const files = await readdir(CACHE_DIR);
          const jsonFiles = files.filter(f => f.endsWith(".json"));
          return Response.json({ files: jsonFiles });
        } catch (error) {
          return Response.json({ error: "Could not read cache directory" }, { status: 500 });
        }
      },
    },

    "/api/cache/:filename": async req => {
      const filename = req.params.filename;
      
      if (filename.includes("..") || filename.includes("/")) {
        return Response.json({ error: "Invalid filename" }, { status: 400 });
      }
      
      const filePath = join(CACHE_DIR, filename);
      const file = Bun.file(filePath);
      
      if (!(await file.exists())) {
        return Response.json({ error: "File not found" }, { status: 404 });
      }
      
      try {
        const content = await file.json();
        return Response.json(content);
      } catch (error) {
        return Response.json({ error: "Could not read file" }, { status: 500 });
      }
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

