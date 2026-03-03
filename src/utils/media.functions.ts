import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { assertSession, queryMedia, saveMediaFiles } from "./media.server";

const listMediaSchema = z.object({
  category: z.string().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().min(0).default(0),
});

export const listMedia = createServerFn({ method: "GET" })
  .inputValidator(listMediaSchema)
  .handler(({ data }) => queryMedia(data));

export const uploadMedia = createServerFn({ method: "POST" })
  .inputValidator((formData: FormData) => formData)
  .handler(async ({ data }) => {
    console.log(data);
    const session = await assertSession();
    console.log(session);

    const category = (data.get("category") as string | null)?.trim();
    if (!category) throw new Error("category is required");

    const files = data.getAll("files") as File[];
    if (files.length === 0) throw new Error("No files provided");

    return saveMediaFiles(files, category, session.user.id);
  });
