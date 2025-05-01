import {drizzle} from "drizzle-orm/neon-http";
import {neon} from "@neondatabase/serverless";

import * as schema from "./schema";

const sql = neon(process.env.NEON_DATABASE_URL! as string);

// used for data querying via drizzle-orm
export const db = drizzle(sql, {schema});
 
// for raw sql queries to neon directly
export {sql};