import Image from "next/image";
import { ProjectCoverArt } from "@/components/project-cover-art";
import { isCloudinaryUrl } from "@/lib/is-cloudinary-url";

export function ProjectCover({
  slug,
  industry,
  coverImage,
  title,
  className = "",
}: {
  slug: string;
  industry: string;
  coverImage?: string;
  title?: string;
  className?: string;
}) {
  if (coverImage && isCloudinaryUrl(coverImage)) {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-[var(--color-line)] ${className}`}>
        <Image
          src={coverImage}
          alt={title ? `${title} cover` : ""}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    );
  }

  if (coverImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- manually pasted URL, host not known ahead of time so next/image can't optimize it
      <img
        src={coverImage}
        alt={title ? `${title} cover` : ""}
        className={`rounded-2xl border border-[var(--color-line)] object-cover ${className}`}
      />
    );
  }

  return <ProjectCoverArt slug={slug} industry={industry} className={className} />;
}
