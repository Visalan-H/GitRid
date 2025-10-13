import { ColumnDef } from '@tanstack/react-table';
import { Repository } from '@/pages/Repositories';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Lock, Unlock, Star, GitFork } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import * as SimpleIcons from 'simple-icons';

export const columns: ColumnDef<Repository>[] = [
    {
        id: 'select',
        header: () => <div></div>,
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={value => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="border-[#ededed]/30"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: 'Repository',
        cell: ({ row }) => {
            const repo = row.original;
            return (
                <div className="flex flex-col gap-2 py-2">
                    <div className="flex items-center gap-2">
                        <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-base text-[#ededed] hover:text-blue-400 transition-colors duration-200 flex items-center gap-1.5 group"
                        >
                            {repo.fullName}
                            <ExternalLink className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </a>
                        {repo.private ? (
                            <div className="p-1 rounded-md bg-yellow-500/10 backdrop-blur-sm">
                                <Lock className="h-3.5 w-3.5 text-yellow-400" />
                            </div>
                        ) : (
                            <div className="p-1 rounded-md bg-green-500/10 backdrop-blur-sm">
                                <Unlock className="h-3.5 w-3.5 text-green-400" />
                            </div>
                        )}
                    </div>
                    {repo.description && (
                        <p className="text-sm text-[#ededed]/50 line-clamp-2 max-w-md">
                            {repo.description}
                        </p>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'language',
        header: 'Language',
        cell: ({ row }) => {
            const language = row.getValue('language') as string;

            const getLanguageIcon = (lang: string) => {
                type IconData = { icon: { svg: string; hex: string } };
                const iconMap: Record<string, IconData> = {
                    JavaScript: { icon: SimpleIcons.siJavascript },
                    TypeScript: { icon: SimpleIcons.siTypescript },
                    Python: { icon: SimpleIcons.siPython },
                    Java: { icon: SimpleIcons.siOpenjdk },
                    'C++': { icon: SimpleIcons.siCplusplus },
                    'C#': { icon: SimpleIcons.siSharp },
                    Ruby: { icon: SimpleIcons.siRuby },
                    Go: { icon: SimpleIcons.siGo },
                    Rust: { icon: SimpleIcons.siRust },
                    PHP: { icon: SimpleIcons.siPhp },
                    Swift: { icon: SimpleIcons.siSwift },
                    Kotlin: { icon: SimpleIcons.siKotlin },
                    Dart: { icon: SimpleIcons.siDart },
                    HTML: { icon: SimpleIcons.siHtml5 },
                    CSS: { icon: SimpleIcons.siCss },
                    Shell: { icon: SimpleIcons.siGnubash },
                    Vue: { icon: SimpleIcons.siVuedotjs },
                    React: { icon: SimpleIcons.siReact },
                    Angular: { icon: SimpleIcons.siAngular },
                    Perl: { icon: SimpleIcons.siPerl },
                    Lua: { icon: SimpleIcons.siLua },
                    Haskell: { icon: SimpleIcons.siHaskell },
                    Elixir: { icon: SimpleIcons.siElixir },
                    C: { icon: SimpleIcons.siC },
                };
                return iconMap[lang] || null;
            };

            const iconData = language ? getLanguageIcon(language) : null;

            return language ? (
                <div className="flex items-center gap-2">
                    {iconData && (
                        <div
                            className="w-5 h-5 flex items-center justify-center"
                            dangerouslySetInnerHTML={{
                                __html: iconData.icon.svg.replace(
                                    '<svg',
                                    `<svg fill="#${iconData.icon.hex}"`
                                ),
                            }}
                        />
                    )}
                    <Badge
                        variant="outline"
                        className="text-sm font-medium text-[#ededed]/90 border-[#ededed]/20 px-3 py-1 bg-[#ededed]/5"
                    >
                        {language}
                    </Badge>
                </div>
            ) : (
                <span className="text-[#ededed]/30 text-sm">N/A</span>
            );
        },
    },
    {
        accessorKey: 'stars',
        header: 'Stars',
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-[#ededed]/80 text-sm font-medium">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400/20" />
                <span>{row.getValue('stars')}</span>
            </div>
        ),
    },
    {
        accessorKey: 'forks',
        header: 'Forks',
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-[#ededed]/80 text-sm font-medium">
                <GitFork className="h-4 w-4 text-blue-400" />
                <span>{row.getValue('forks')}</span>
            </div>
        ),
    },
    {
        accessorKey: 'updatedAt',
        header: 'Last Updated',
        cell: ({ row }) => {
            const dateValue = row.getValue('updatedAt');
            if (!dateValue) {
                return <span className="text-[#ededed]/30 text-sm">N/A</span>;
            }
            try {
                const date = new Date(dateValue as string);
                if (isNaN(date.getTime())) {
                    return <span className="text-[#ededed]/30 text-sm">N/A</span>;
                }
                return (
                    <span className="text-[#ededed]/60 text-sm">
                        {formatDistanceToNow(date, { addSuffix: true })}
                    </span>
                );
            } catch {
                return <span className="text-[#ededed]/30 text-sm">N/A</span>;
            }
        },
    },
];
