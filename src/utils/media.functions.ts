import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { assertSession, deleteMediaById, queryMedia, saveMediaFiles, updateMediaById } from "./media.server";

const listMediaSchema = z.object({
  category: z.string().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().min(0).default(0),
});

export const listMedia = createServerFn({ method: "GET" })
  .inputValidator(listMediaSchema)
  .handler(({ data }) => queryMedia(data));

export const updateMedia = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      originalName: z.string().trim().min(1).optional(),
      category: z.string().trim().min(1).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await assertSession();
    await updateMediaById(data.id, data);
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await assertSession();
    await deleteMediaById(data.id);
  });

export const uploadMedia = createServerFn({ method: "POST" })
  .inputValidator((formData: FormData) => formData)
  .handler(async ({ data }) => {
    const session = await assertSession();

    const category = (data.get("category") as string | null)?.trim();
    if (!category) throw new Error("category is required");

    const files = data.getAll("files") as File[];
    if (files.length === 0) throw new Error("No files provided");

    return saveMediaFiles(files, category, session.user.id);
  });
