import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { CORS_HEADERS } from "../_shared/cors.ts";

import { DbSchema } from "../_shared/types.ts";
import { getExceptionMessage, throwError } from "../_shared/errorUtils.ts";
import { parseJobDescription } from "../_shared/jobDescriptionParser.ts";
import { applyAdvancedMatchingFilters } from "../_shared/advancedMatching.ts";
import { Job } from "../_shared/types.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }
    const supabaseClient = createClient<DbSchema>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const body: { jobId: number; html: string } = await req.json();
    const { jobId, html } = body;

    // find the job and its site
    const { data: job, error: findJobErr } = await supabaseClient
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();
    if (findJobErr) {
      throw findJobErr;
    }
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    const { data: site, error: findSiteErr } = await supabaseClient
      .from("sites")
      .select("*")
      .eq("id", job.siteId)
      .single();
    if (findSiteErr) {
      throw findSiteErr;
    }

    let updatedJob: Job = { ...job, status: "new" };
    if (!job.description) {
      // parse the job description
      console.log(
        `[${site.provider}] parsing job description for ${jobId} ...`
      );

      // update the job with the description
      const jd = parseJobDescription({ site, job, html });
      updatedJob = {
        ...updatedJob,
        description: jd.content ?? updatedJob.description,
      };
      if (!jd.content) {
        console.error(
          `[${site.provider}] no JD details extracted from the html of job ${jobId} (${job.url}), this could be a problem with the parser`
        );
      }

      const filteredJobStatus = await applyAdvancedMatchingFilters({
        job: updatedJob,
        supabaseClient,
        openAiApiKey:
          Deno.env.get("OPENAI_API_KEY") ??
          throwError("missing OPENAI_API_KEY"),
      });

      updatedJob = { ...updatedJob, status: filteredJobStatus };
    }

    console.log(`[${site.provider}] ${updatedJob.status} ${job.title}`);

    const { error: updateJobErr } = await supabaseClient
      .from("jobs")
      .update({
        description: updatedJob.description,
        status: updatedJob.status,
        updated_at: new Date(),
      })
      .eq("id", jobId);
    if (updateJobErr) {
      throw updateJobErr;
    }

    console.log(
      `[${site.provider}] finished parsing job description for ${job.title}`
    );

    return new Response(JSON.stringify({ job: updatedJob }), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (error) {
    console.error(getExceptionMessage(error));
    return new Response(
      JSON.stringify({ errorMessage: getExceptionMessage(error, true) }),
      {
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        // until this is fixed: https://github.com/supabase/functions-js/issues/45
        // we have to return 200 and handle the error on the client side
        // status: 500,
      }
    );
  }
});
