import { ProjectCoverArt } from "@/components/project-cover-art";

export function ProjectCover({
  slug,
  industry,
  coverImage,
  className = "",
}: {
  slug: string;
  industry: string;
  coverImage?: string;
  className?: string;
}) {
  if (coverImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URL, dimensions vary per upload
      <img
        src={coverImage}
        alt=""
        className={`rounded-2xl border border-[var(--color-line)] object-cover ${className}`}
      />
    );
  }

  return <ProjectCoverArt slug={slug} industry={industry} className={className} />;
}
