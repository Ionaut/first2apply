import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { CORS_HEADERS } from "../_shared/cors.ts";
import { DbSchema, Job } from "../_shared/types.ts";
import { getExceptionMessage } from "../_shared/errorUtils.ts";
import { cleanJobUrl } from "../_shared/jobListParser.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { title, url } = await req.json();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }
    const supabaseClient = createClient<DbSchema>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // list all job sites from db
    const { data, error: selectError } = await supabaseClient
      .from("sites")
      .select("*");
    if (selectError) throw new Error(selectError.message);
    const allJobSites = data ?? [];

    // insert a new link in the db
    const { cleanUrl, site } = cleanJobUrl({ url, allJobSites });
    const { data: createdLinks, error } = await supabaseClient
      .from("links")
      .insert({
        url: cleanUrl,
        title,
        site_id: site.id,
      })
      .select("*");
    if (error) throw error;

    const [link] = createdLinks ?? [];

    // legacy, we don't parse the jobs list when creating a new link anymore
    // but need to still return an empty array for compatibility
    const newJobs: Job[] = [];

    return new Response(JSON.stringify({ link, newJobs }), {
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
        // status: 400,
      }
    );
  }
});
