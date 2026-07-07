import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, CheckCircle2, Loader2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface DocumentItem {
  id: string;
  filename: string;
  status: "processing" | "ready" | "failed";
  chunk_count: number;
}

export default function DocumentsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => (await api.get<DocumentItem[]>("/documents")).data,
    refetchInterval: (query) =>
      query.state.data?.some((d) => d.status === "processing") ? 3000 : false,
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await api.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Document uploaded — processing started");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Document Learning</h1>
        <p className="text-text-muted mt-1">
          Upload a PDF, DOCX, or slide deck — the tutor answers only from what's inside it.
        </p>
      </header>

      <label className="glass-panel flex flex-col items-center justify-center gap-3 py-12 cursor-pointer hover:border-accent-blue/40 transition-colors mb-8">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.pptx"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
          {uploading ? <Loader2 size={20} className="text-white animate-spin" /> : <Upload size={20} className="text-white" />}
        </div>
        <p className="text-sm font-medium">{uploading ? "Uploading..." : "Click to upload a document"}</p>
        <p className="text-xs text-text-muted">PDF, DOCX, PPTX, TXT — up to 20MB</p>
      </label>

      <div className="flex flex-col gap-3">
        {documents?.map((doc) => (
          <div key={doc.id} className="glass-card p-4 flex items-center gap-3">
            <FileText size={18} className="text-accent-blue shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{doc.filename}</p>
              <p className="text-xs text-text-muted">
                {doc.status === "ready" ? `${doc.chunk_count} chunks indexed` : doc.status}
              </p>
            </div>
            <StatusBadge status={doc.status} />
          </div>
        ))}
        {documents?.length === 0 && (
          <p className="text-center text-text-muted text-sm py-8">No documents uploaded yet.</p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: DocumentItem["status"] }) {
  if (status === "ready")
    return (
      <span className="flex items-center gap-1 text-xs text-accent-cyan">
        <CheckCircle2 size={14} /> Ready
      </span>
    );
  if (status === "failed")
    return (
      <span className="flex items-center gap-1 text-xs text-red-400">
        <XCircle size={14} /> Failed
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-xs text-text-muted">
      <Loader2 size={14} className="animate-spin" /> Processing
    </span>
  );
}
