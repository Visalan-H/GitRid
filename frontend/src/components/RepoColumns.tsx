import { ColumnDef } from "@tanstack/react-table";
import { Repository } from "@/pages/Repositories";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Lock, Unlock, Star, GitFork } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const columns: ColumnDef<Repository>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Repository",
    cell: ({ row }) => {
      const repo = row.original;
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#ededed] hover:underline flex items-center gap-1"
            >
              {repo.full_name}
              <ExternalLink className="h-3 w-3" />
            </a>
            {repo.private ? (
              <Lock className="h-3 w-3 text-yellow-500" />
            ) : (
              <Unlock className="h-3 w-3 text-green-500" />
            )}
          </div>
          {repo.description && (
            <p className="text-sm text-[#ededed]/60 truncate max-w-md">
              {repo.description}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "language",
    header: "Language",
    cell: ({ row }) => {
      const language = row.getValue("language") as string;
      return language ? (
        <Badge variant="outline" className="text-[#ededed]/80 border-[#ededed]/20">
          {language}
        </Badge>
      ) : (
        <span className="text-[#ededed]/40">—</span>
      );
    },
  },
  {
    accessorKey: "stargazers_count",
    header: "Stars",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-[#ededed]/80">
        <Star className="h-4 w-4 text-yellow-500" />
        {row.getValue("stargazers_count")}
      </div>
    ),
  },
  {
    accessorKey: "forks_count",
    header: "Forks",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-[#ededed]/80">
        <GitFork className="h-4 w-4 text-blue-500" />
        {row.getValue("forks_count")}
      </div>
    ),
  },
  {
    accessorKey: "updated_at",
    header: "Last Updated",
    cell: ({ row }) => {
      const date = new Date(row.getValue("updated_at"));
      return (
        <span className="text-[#ededed]/60 text-sm">
          {formatDistanceToNow(date, { addSuffix: true })}
        </span>
      );
    },
  },
];
