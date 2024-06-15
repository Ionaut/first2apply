import { FC } from 'react';

import { Skeleton } from '../ui/skeleton';

export function JobsListSkeleton() {
  return (
    <ul>
      {Array.from({ length: 10 }).map((_, index) => (
        <li key={index} className="-mt-[1px] px-2 pt-6 xl:px-4">
          <div className="mb-6 flex items-center gap-4">
            {/* Avatar */}
            <Skeleton className="h-16 min-w-16 rounded-full" />
            <div className="grow space-y-1">
              {/* Company Name */}
              <Skeleton className="h-4 w-full max-w-20" />
              {/* Job Title */}
              <Skeleton className="mt-0.5 h-5 w-full max-w-60" />

              {/* Location, JobType & Salary */}
              <div className="flex items-center gap-1.5 pt-2">
                <Skeleton className="h-5 w-full max-w-32" />
                <Skeleton className="h-5 w-full max-w-20" />

                <div className="ml-auto flex gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
          <Skeleton className="h-px w-full" /> {/* Divider */}
        </li>
      ))}
    </ul>
  );
}

export function JobSummarySkeleton() {
  return (
    <div className="rounded-lg border border-muted p-4 lg:p-6">
      <div className="flex items-start justify-between gap-4 lg:gap-6">
        <div className="flex-1">
          <Skeleton className="mt-3 h-7 w-full max-w-80 lg:mt-4" />
          <Skeleton className="mt-2 h-4 w-full max-w-52" />
        </div>

        <Skeleton className="h-16 w-16 rounded-full" />
      </div>

      <div className="mt-3 space-y-1.5 lg:mt-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-20" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 min-w-5" />
          <Skeleton className="h-5 w-full max-w-64" />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 lg:mt-10">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-[148px] lg:ml-auto" />
      </div>
    </div>
  );
}

export function JobDetailsSkeleton() {
  return (
    <div className="space-y-1 pl-[25px] pr-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-6 w-2/3" />
      <div className="h-6" />
      <Skeleton className="h-6 w-[99%]" />
      <Skeleton className="h-6 w-[95%]" />
      <Skeleton className="h-6 w-[97%]" />
      <Skeleton className="h-6 w-[99%]" />
      <div className="h-6" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-6 w-[99%]" />
      <Skeleton className="h-6 w-[95%]" />
      <Skeleton className="h-6 w-[97%]" />
      <Skeleton className="h-6 w-[99%]" />
      <Skeleton className="h-6 w-[99%]" />
      <Skeleton className="h-6 w-[95%]" />
      <Skeleton className="h-6 w-[97%]" />
      <Skeleton className="h-6 w-[99%]" />
      <Skeleton className="h-6 w-[99%]" />
      <Skeleton className="h-6 w-[95%]" />
      <Skeleton className="h-6 w-[97%]" />
      <Skeleton className="h-6 w-[99%]" />
    </div>
  );
}

export const JobsSkeleton: FC = () => {
  return (
    <section className="flex">
      <div className="no-scrollbar h-[calc(100vh-100px)] w-1/2 overflow-scroll lg:w-2/5">
        <JobsListSkeleton />
      </div>

      <div className="h-[calc(100vh-100px)] w-1/2 animate-pulse space-y-4 overflow-scroll border-l-[1px] border-muted pl-2 lg:w-3/5 lg:space-y-5 lg:pl-4">
        <JobSummarySkeleton />
        <JobDetailsSkeleton />
      </div>
    </section>
  );
};
