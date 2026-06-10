import { NextResponse } from "next/server";
import { captureBucket, createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();
    
    // Find captures older than 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    const { data: oldCaptures, error: selectError } = await supabase
      .from("captures")
      .select("id, image_url")
      .lt("created_at", fortyEightHoursAgo);

    if (selectError) {
      console.error("Failed to select old captures:", selectError.message);
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    if (!oldCaptures || oldCaptures.length === 0) {
      return NextResponse.json({ ok: true, deletedCount: 0, message: "No old captures to clean up." });
    }

    // Extract storage paths from storage URIs (supabase://bucketName/path)
    const storagePaths: string[] = [];
    const captureIds: string[] = [];

    const prefix = `supabase://${captureBucket}/`;
    for (const capture of oldCaptures) {
      captureIds.push(capture.id);
      if (capture.image_url.startsWith(prefix)) {
        storagePaths.push(capture.image_url.replace(prefix, ""));
      }
    }

    // Delete files from storage bucket
    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(captureBucket)
        .remove(storagePaths);

      if (storageError) {
        console.error("Failed to delete storage objects:", storageError.message);
        // We do not return 500 here, because we still want to try deleting the DB rows
        // However, if the bucket fails, the files remain orphaned.
      }
    }

    // Delete rows from database
    if (captureIds.length > 0) {
      const { error: dbDeleteError } = await supabase
        .from("captures")
        .delete()
        .in("id", captureIds);

      if (dbDeleteError) {
        console.error("Failed to delete capture rows:", dbDeleteError.message);
        return NextResponse.json({ error: dbDeleteError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      ok: true, 
      deletedCount: captureIds.length,
      message: `Successfully cleaned up ${captureIds.length} old captures.`
    });

  } catch (error) {
    console.error("Cleanup cron unhandled error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Capture cleanup failed." },
      { status: 500 }
    );
  }
}
