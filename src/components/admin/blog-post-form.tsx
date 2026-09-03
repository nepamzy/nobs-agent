"use client";

import { ImageUpload } from "./image-upload";

type PostFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string | null;
  postType: string;
  coverImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  published: boolean;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-brass)]";
const labelClass = "mb-1.5 block text-xs font-medium text-[var(--color-slate)]";

export function BlogPostForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  defaultValues?: Partial<PostFormValues>;
}) {
  return (
    <form action={action} className="glass space-y-5 rounded-2xl p-8">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="blog-post-title" className={labelClass}>Title</label>
          <input id="blog-post-title" name="title" required defaultValue={defaultValues?.title} className={inputClass} />
        </div>
        {!defaultValues?.id && (
          <div>
            <label htmlFor="blog-post-slug" className={labelClass}>Slug (leave blank to auto-generate)</label>
            <input id="blog-post-slug" name="slug" className={inputClass} />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="blog-post-excerpt" className={labelClass}>Excerpt</label>
        <textarea
          id="blog-post-excerpt"
          name="excerpt"
          required
          rows={2}
          defaultValue={defaultValues?.excerpt}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="blog-post-content" className={labelClass}>
          Content, separate paragraphs with a blank line
        </label>
        <textarea
          id="blog-post-content"
          name="content"
          required
          rows={10}
          defaultValue={defaultValues?.content}
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="blog-post-type" className={labelClass}>Content type</label>
          <select
            id="blog-post-type"
            name="postType"
            defaultValue={defaultValues?.postType ?? "ARTICLE"}
            className={inputClass}
          >
            <option value="ARTICLE">Article</option>
            <option value="BUILD_LOG">Build Log / Engineering Note</option>
          </select>
          <p className="mt-1.5 text-[11px] text-[var(--color-slate)]">
            Build Logs are technical, project-specific write-ups (e.g. how a feature was
            architected or built). Shown with their own filter/badge on the public blog.
          </p>
        </div>
        <div>
          <label htmlFor="blog-post-category" className={labelClass}>Category</label>
          <input
            id="blog-post-category"
            name="category"
            defaultValue={defaultValues?.category ?? undefined}
            className={inputClass}
          />
        </div>
      </div>

      <ImageUpload
        name="coverImage"
        label="Cover image"
        defaultValue={defaultValues?.coverImage}
        folder="nobs-agent/blog"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="blog-post-meta-title" className={labelClass}>Meta title (SEO, optional)</label>
          <input
            id="blog-post-meta-title"
            name="metaTitle"
            defaultValue={defaultValues?.metaTitle ?? undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="blog-post-meta-description" className={labelClass}>Meta description (SEO, optional)</label>
          <input
            id="blog-post-meta-description"
            name="metaDescription"
            defaultValue={defaultValues?.metaDescription ?? undefined}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={defaultValues?.published}
          className="h-4 w-4 accent-[var(--color-brass)]"
        />
        Published
      </label>

      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
      >
        {defaultValues?.id ? "Save changes" : "Create post"}
      </button>
    </form>
  );
}
