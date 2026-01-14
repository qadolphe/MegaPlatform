"use server";

import { email } from "@repo/services";
import { createClient } from "@/lib/supabase/server";

export async function sendTaskAssignmentEmail({
  toEmail,
  taskTitle,
  storeName,
  assignerName,
}: {
  toEmail: string;
  taskTitle: string;
  storeName: string;
  assignerName: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    await email.sendEmail({
      to: toEmail,
      subject: `New Task Assigned: ${taskTitle}`,
      html: `
        <h2>New Task Assignment</h2>
        <p><strong>${assignerName}</strong> has assigned you to a new task in <strong>${storeName}</strong>.</p>
        <p><strong>Task:</strong> ${taskTitle}</p>
        <br/>
        <p>Log in to the dashboard to view details.</p>
      `,
      fromDomain: "swatbloc.com", // Assuming email domain, needs to be verified in Resend
      fromName: "Task Planner",
    });
  } catch (error) {
    console.error("Failed to send assignment email:", error);
    // Don't fail the action if email fails
  }
}
