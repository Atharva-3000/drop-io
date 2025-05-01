import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({path: ".env.local"});

if(!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in .env.local file");
}

export default defineConfig({
    schema:"./lib/db/schema.ts",
    out:"./drizzle",
    dialect: "postgresql",
    dbCredentials:{
        url:process.env.DATABASE_URL!,
    },
    migrations:{
        table:"__drizzle_migrations",
        schema:"public",
    },
    // THOROUGH logging for debugging
    verbose:true,
    
    // used for an extra confirmation when running migrations
    // this is useful for production, but not for development
    strict:true,
});


