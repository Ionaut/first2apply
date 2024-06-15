import { useSites } from '@/hooks/sites';
import { openExternalUrl } from '@/lib/electronMainSdk';
import { TrashIcon } from '@radix-ui/react-icons';
import { useMemo } from 'react';
import ReactTimeAgo from 'react-time-ago';

import { Link } from '../../../supabase/functions/_shared/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

export function LinksList({ links, onDeleteLink }: { links: Link[]; onDeleteLink: (linkId: number) => void }) {
  const { siteLogos, sites } = useSites();
  const sitesMap = useMemo(() => new Map(sites.map((s) => [s.id, s])), [sites]);

  return (
    <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:gap-6">
      {links.map((link) => {
        return (
          <li
            key={link.id}
            className="flex cursor-pointer flex-col gap-4 rounded-lg border border-border bg-card px-6 pb-6 pt-8 shadow-sm"
            onClick={() => {
              openExternalUrl(link.url);
            }}
          >
            <div className="flex items-center gap-2">
              <Avatar
                className="h-12 w-12 cursor-pointer"
                onClick={() => {
                  openExternalUrl(link.url);
                }}
              >
                <AvatarImage src={siteLogos[link.site_id]} />
                <AvatarFallback className="text-xl tracking-wider">LI</AvatarFallback>
              </Avatar>

              <div>
                <p className="p-0 text-sm text-muted-foreground">{sitesMap.get(link.site_id)?.name}</p>
                <p className="text-balance text-lg leading-6">{link.title}</p>
              </div>
            </div>

            <p className="mb-4 mt-6 grow whitespace-pre-wrap text-pretty break-all text-xs font-light text-muted-foreground">
              {link.url}
            </p>

            <div className="flex items-center justify-between">
              <p className="text-sm font-light text-foreground/20">
                {'Added '}
                <ReactTimeAgo date={link.created_at} locale="en-US" />
              </p>

              {/* actions */}
              <Button
                variant="destructive"
                size="default"
                className="rounded-full bg-destructive/10 px-2 py-1 text-sm transition-colors duration-200 ease-in-out hover:bg-destructive/20 focus:bg-destructive/20"
                onClick={(evt) => {
                  evt.stopPropagation();
                  onDeleteLink(link.id);
                }}
              >
                <TrashIcon className="h-5 w-5 text-destructive" />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
