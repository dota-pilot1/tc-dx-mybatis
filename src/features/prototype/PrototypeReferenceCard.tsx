import { openUrl } from "@tauri-apps/plugin-opener";
import {
  ArrowRight,
  ExternalLink,
  FileText,
  GitBranch,
  ImageOff,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import type { CatalogCategory, CatalogPrototype } from "./api";

const STATUS_LABEL: Record<string, string> = {
  draft: "초안",
  building: "제작중",
  ready: "완료",
};

type PrototypeReferenceCardProps = {
  category?: CatalogCategory | null;
  prototype: CatalogPrototype;
  onOpenNotes?: () => void;
  onOpenPrototype?: () => void;
  onEdit?: () => void;
  imageClassName?: string;
  titleClassName?: string;
  summaryClassName?: string;
  className?: string;
  showTags?: boolean;
};

function PrototypeReferenceCard({
  category,
  prototype,
  onOpenNotes,
  onOpenPrototype,
  onEdit,
  imageClassName = "h-32",
  titleClassName = "text-base leading-6",
  summaryClassName = "line-clamp-2",
  className = "",
  showTags = true,
}: PrototypeReferenceCardProps) {
  const hasGithub = prototype.repoUrl.trim().length > 0;
  const siteUrl = prototype.demoUrl || prototype.figmaUrl;
  const hasSite = Boolean(siteUrl);

  return (
    <article
      className={
        "flex min-h-[280px] flex-col overflow-hidden rounded-md border border-surface-border bg-surface-raised shadow-sm transition-colors hover:bg-surface-muted " +
        className
      }
    >
      <div className={`${imageClassName} border-b border-surface-border bg-surface-muted`}>
        {prototype.images[0] ? (
          <img
            src={prototype.images[0]}
            alt={prototype.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-text-muted">
            <ImageOff className="size-6" strokeWidth={1.5} />
            <span className="text-xs font-bold">이미지 없음</span>
          </div>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="rounded border border-brand-border bg-brand-glass px-1.5 py-0.5 text-[10px] font-black text-brand-primary">
              {STATUS_LABEL[prototype.status] ?? prototype.status}
            </span>
            {category ? (
              <span className="max-w-full truncate rounded border border-surface-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-bold text-text-secondary">
                {category.title}
              </span>
            ) : null}
          </div>
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="grid size-8 shrink-0 place-items-center rounded-md border border-surface-border-soft bg-surface-muted text-text-secondary hover:border-brand-border hover:text-brand-primary"
              title="프로토타입 편집"
            >
              <Pencil className="size-4" />
            </button>
          ) : null}
        </div>
        <h3
          className={`mt-3 line-clamp-2 font-black text-text-primary ${titleClassName}`}
        >
          {prototype.title}
        </h3>
        <p
          className={`mt-2 text-sm font-semibold leading-6 text-text-secondary ${summaryClassName}`}
        >
          {prototype.summary || "요약 없음"}
        </p>
        <div className="mt-auto pt-4">
          {showTags && prototype.tags.length > 0 ? (
            <div className="mb-3 flex min-w-0 flex-wrap gap-1">
              {prototype.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-surface-muted px-1.5 py-0.5 text-[11px] font-bold text-text-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
          <div className="grid gap-2">
            {onOpenPrototype ? (
              <PrototypeReferenceButton
                icon={ArrowRight}
                label="프로토타입으로 이동"
                enabled
                title="프로토타입으로 이동"
                onClick={onOpenPrototype}
              />
            ) : null}
            {onOpenNotes ? (
              <PrototypeReferenceButton
                icon={FileText}
                label="노트"
                enabled
                title="연관 노트로 이동"
                onClick={onOpenNotes}
              />
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              <PrototypeReferenceButton
                icon={GitBranch}
                label="GitHub"
                enabled={hasGithub}
                title={hasGithub ? "GitHub 주소 열기" : "GitHub 주소 없음"}
                onClick={() => void openUrl(prototype.repoUrl)}
              />
              <PrototypeReferenceButton
                icon={ExternalLink}
                label="URL"
                enabled={hasSite}
                title={hasSite ? "사이트 주소 열기" : "사이트 주소 없음"}
                onClick={() => siteUrl && void openUrl(siteUrl)}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function PrototypeReferenceButton({
  icon: Icon,
  label,
  enabled,
  title,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  enabled: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={onClick}
      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-3 text-sm font-black text-brand-primary hover:bg-surface-raised disabled:cursor-not-allowed disabled:border-surface-border-soft disabled:bg-surface-muted disabled:text-text-muted"
      title={title}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

export default PrototypeReferenceCard;
