import {pgTable, integer, text, uuid, boolean, timestamp} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const files = pgTable("files",{
    id: uuid("id").primaryKey().defaultRandom(),

    // information
    name: text("name").notNull(),
    path: text("path").notNull(),
    size: integer("size").notNull(),
    type: text("type").notNull(),   //can hardcode types

    // storage fields
    // self relation for folders and files, since internally they are the same
    fileUr: text("file_url").notNull(), //url to access file
    thumbnailUrl: text("thumbnail_url"),
    
    // ownership
    userId: text("user_id").notNull(),
    parentId: uuid("parent_id").notNull(),

    // file flags like bookmarks and stuff for filternig in ui
    isFolder: boolean("is_folder").default(false).notNull(),
    isStarred: boolean("is_starred").default(false).notNull(),
    isTrash: boolean("is_trash").default(false).notNull(), 

    // timstamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
})


// relations 

// each file can have many children, and each child can have one parent
// this is a self relation, since files and folders are the same in the database

// on to many akak one parent to many children
export const filesRelation = relations(files,({one, many}) => ({
    // from
    parent: one(files, 

        {fields: [files.parentId],

        references: [files.id]}),

    // to
    children: many(files), 
}))

// type def for files table
// this is used for the select and insert types
// select type is used for selecting data from the database
// insert type is used for inserting data into the database
export const FILE = typeof files.$inferSelect
export const NewFile = typeof files.$inferInsert