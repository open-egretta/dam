import { createServerFn } from "@tanstack/react-start";
import { assertSession, saveMediaFiles } from "./media.server";

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
