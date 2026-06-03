import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Image,
  File,
  Trash2,
  Download,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { FileService } from "@/shared/api/services";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { ViewToggle } from "@/components/ui/ViewToggle";
import {
  DataTable,
  Pagination,
  type Column,
} from "@/components/data-table/DataTable";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatRelative } from "@/lib/date";
import { cn } from "@/lib/utils";
import { staggerContainer, cardItem } from "@/lib/animations";

interface FileDto {
  id: string;
  createdAt: string;
  name: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  url?: string;
  isPublic?: boolean;
  entityType?: string;
}

const EXT_META: Record<
  string,
  { bg: string; color: string; icon: React.ElementType }
> = {
  image: { bg: "#F0FFF4", color: "#16A34A", icon: Image },
  pdf: { bg: "#FFF0EA", color: "#E8541A", icon: FileText },
  text: { bg: "#E8F4F8", color: "#2E8FAD", icon: FileText },
  csv: { bg: "#E8F4F8", color: "#1B5E82", icon: FileText },
};
const FB_META = { bg: "#F0F2F4", color: "#4A7A94", icon: File };

function getMeta(mimeType?: string) {
  if (!mimeType) return FB_META;
  if (mimeType.startsWith("image/")) return EXT_META["image"];
  if (mimeType === "application/pdf") return EXT_META["pdf"];
  if (mimeType.startsWith("text/")) return EXT_META["text"];
  return FB_META;
}

function fmtSize(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function FileCard({ f, onDelete }: { f: FileDto; onDelete: () => void }) {
  const meta = getMeta(f.mimeType);
  const Icon = meta.icon;
  const isImage = f.mimeType?.startsWith("image/");

  return (
    <motion.div
      variants={cardItem}
      className="bg-white border border-[#E5E7EB] rounded-[16px] overflow-hidden flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(13,33,55,0.08)] hover:border-[#6AB8D4]/50 duration-[200ms]"
    >
      {isImage && f.url ? (
        <div className="h-28 bg-[#F0F2F4] overflow-hidden">
          <img
            src={f.url}
            alt={f.originalName ?? f.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className="h-20 flex items-center justify-center"
          style={{ background: meta.bg }}
        >
          <Icon size={28} style={{ color: meta.color }} />
        </div>
      )}
      <div className="p-3.5 flex-1 flex flex-col gap-2">
        <div>
          <p
            className="font-medium text-[13px] text-[#0D2137] truncate"
            title={f.originalName ?? f.name}
          >
            {f.originalName ?? f.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-[#8BAFC0]">
              {fmtSize(f.size)}
            </span>
            {f.mimeType && (
              <span className="text-[10px] font-mono text-[#B8CDD8] bg-[#F7F8F9] px-1.5 py-0.5 rounded">
                {f.mimeType.split("/")[1]}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[#F0F2F4]">
          <span className="text-[11px] text-[#8BAFC0]">
            {formatRelative(f.createdAt)}
          </span>
          <div className="flex gap-1.5">
            {f.url && (
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-[6px] border border-[#E5E7EB] flex items-center justify-center text-[#8BAFC0] hover:text-[#2E8FAD] hover:border-[#C8E8F2] hover:bg-[#E8F4F8] transition-all"
              >
                <Download size={11} />
              </a>
            )}
            <button
              onClick={onDelete}
              className="w-6 h-6 rounded-[6px] border border-[#E5E7EB] flex items-center justify-center text-[#8BAFC0] hover:text-[#DC2626] hover:border-[#FCA5A5] hover:bg-[#FEE2E2] transition-all cursor-pointer"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function FilesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"card" | "table">("card");
  const [isDragging, setIsDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const pageSize = 24;

  const { data, isLoading } = useQuery({
    queryKey: ["files", search, page],
    queryFn: () =>
      FileService.search({
        pageNumber: page,
        pageSize,
        searchTerm: search || undefined,
      }),
  });
  const files: FileDto[] = data?.data?.items ?? [];
  const total: number = data?.data?.totalCount ?? files.length;

  const uploadMut = useMutation({
    mutationFn: (file: File) => FileService.upload(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["files"] });
      toast.success("Fichier uploadé");
    },
    onError: () => toast.error("Erreur lors de l'upload"),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => FileService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["files"] });
      toast.success("Fichier supprime");
    },
    onError: () => toast.error("Erreur"),
  });

  const handleFiles = (fl: FileList | null) => {
    if (!fl) return;
    Array.from(fl).forEach((f) => uploadMut.mutate(f));
  };

  const columns: Column<FileDto>[] = [
    {
      key: "name",
      label: "Fichier",
      render: (f) => {
        const meta = getMeta(f.mimeType);
        const Icon = meta.icon;
        return (
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
              style={{ background: meta.bg }}
            >
              <Icon size={14} style={{ color: meta.color }} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#0D2137]">
                {f.originalName ?? f.name}
              </p>
              {f.mimeType && (
                <p className="text-[11px] font-mono text-[#8BAFC0]">
                  {f.mimeType}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "size",
      label: "Taille",
      width: "90px",
      render: (f) => (
        <span className="text-[12.5px] text-[#4A7A94]">{fmtSize(f.size)}</span>
      ),
    },
    {
      key: "entityType",
      label: "Type",
      width: "110px",
      render: (f) =>
        f.entityType ? (
          <Badge variant="info">{f.entityType}</Badge>
        ) : (
          <span className="text-[12px] text-[#8BAFC0]">—</span>
        ),
    },
    {
      key: "isPublic",
      label: "Acces",
      width: "90px",
      render: (f) => (
        <Badge variant={f.isPublic ? "success" : "neutral"}>
          {f.isPublic ? "Public" : "Prive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      width: "120px",
      render: (f) => (
        <span className="text-[12px] text-[#8BAFC0]">
          {formatRelative(f.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "80px",
      render: (f) => (
        <div className="flex gap-1">
          {f.url && (
            <a href={f.url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost">
                <Download size={12} />
              </Button>
            </a>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              deleteMut.mutate(f.id);
            }}
          >
            <Trash2 size={12} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-7">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
            Fichiers
          </h1>
          <p className="text-[12.5px] text-[#4A7A94] mt-1">
            {total.toLocaleString("fr")} fichiers stockes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Rechercher un fichier..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            containerClassName="w-52"
          />
          <ViewToggle view={view} onChange={setView} />
          <input
            ref={fileInput}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button
            variant="primary"
            onClick={() => fileInput.current?.click()}
            loading={uploadMut.isPending}
          >
            <Upload size={13} />
            Uploader
          </Button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInput.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-[16px] p-6 mb-5 text-center cursor-pointer transition-all",
          isDragging
            ? "border-[#2E8FAD] bg-[#E8F4F8]"
            : "border-[#E5E7EB] bg-[#F7F8F9] hover:border-[#6AB8D4] hover:bg-[#F0F8FC]",
        )}
      >
        <Upload
          size={20}
          className={cn(
            "mx-auto mb-2",
            isDragging ? "text-[#2E8FAD]" : "text-[#8BAFC0]",
          )}
        />
        <p
          className={cn(
            "text-[13px]",
            isDragging ? "text-[#2E8FAD] font-medium" : "text-[#4A7A94]",
          )}
        >
          {isDragging
            ? "Deposez les fichiers ici"
            : "Glissez-deposez des fichiers ou cliquez pour choisir"}
        </p>
        <p className="text-[12px] text-[#8BAFC0] mt-1">
          Images, PDF, CSV, documents — Max 50 MB
        </p>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : files.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={32} />}
          title="Aucun fichier"
          description="Uploadez vos premiers fichiers"
        />
      ) : view === "card" ? (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-5 gap-3 mb-5"
          style={{ gridTemplateColumns: "repeat(5,minmax(0,1fr))" }}
        >
          {files.map((f) => (
            <FileCard
              key={f.id}
              f={f}
              onDelete={() => deleteMut.mutate(f.id)}
            />
          ))}
        </motion.div>
      ) : (
        <div className="mb-5">
          <DataTable
            columns={columns}
            data={files}
            loading={isLoading}
            getRowId={(f) => f.id}
            emptyTitle="Aucun fichier"
          />
        </div>
      )}
      <Pagination
        total={total}
        pageSize={pageSize}
        page={page}
        onChange={setPage}
      />
    </div>
  );
}
