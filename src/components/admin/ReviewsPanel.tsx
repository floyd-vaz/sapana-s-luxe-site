import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminListReviews, adminSetReviewApproval } from "@/lib/admin.functions";
import { Panel, chipClass } from "./AdminShell";

type ReviewRow = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  approved_status: boolean;
  created_at: string;
};

export function ReviewsPanel() {
  const listReviews = useServerFn(adminListReviews);
  const setApproval = useServerFn(adminSetReviewApproval);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: () => listReviews() as Promise<ReviewRow[]>,
  });

  const toggle = useMutation({
    mutationFn: (input: { id: string; approvedStatus: boolean }) =>
      setApproval({ data: input as never }),
    onSuccess: () => {
      toast.success("Review updated");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not update"),
  });

  return (
    <Panel title="Review moderation">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">No reviews submitted yet.</p>
      ) : (
        <ul className="space-y-2">
          {data.map((r) => (
            <li key={r.id} className="glass-soft rounded-2xl px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-foreground">
                  {r.customer_name} · {"★".repeat(r.rating)}
                </p>
                <button
                  className={chipClass}
                  onClick={() => toggle.mutate({ id: r.id, approvedStatus: !r.approved_status })}
                >
                  {r.approved_status ? "Unpublish" : "Approve"}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
