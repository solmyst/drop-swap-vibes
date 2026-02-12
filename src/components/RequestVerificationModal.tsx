import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BadgeCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RequestVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const RequestVerificationModal = ({ open, onOpenChange, userId }: RequestVerificationModalProps) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for verification");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('verification_requests')
      .insert({
        user_id: userId,
        reason: reason.trim(),
        status: 'pending'
      });

    setLoading(false);

    if (error) {
      if (error.code === '23505') {
        toast.error("You already have a pending verification request");
      } else {
        toast.error("Failed to submit request");
      }
      return;
    }

    toast.success("Verification request submitted!");
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-primary" />
            Request Verification
          </DialogTitle>
          <DialogDescription>
            Tell us why you should be verified. Verified users get a badge next to their name.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Why should you be verified?
            </label>
            <Textarea
              placeholder="E.g., I'm a trusted seller with 50+ successful sales, or I'm a verified brand representative..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Verification is reviewed by admins and helps build trust in the community.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestVerificationModal;
