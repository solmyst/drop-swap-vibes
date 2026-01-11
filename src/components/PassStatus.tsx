import { motion } from "framer-motion";
import { MessageCircle, Package, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { usePassBenefits } from "@/hooks/usePassBenefits";
import { getPassDetails } from "@/components/PassCard";
import { Link } from "react-router-dom";

const PassStatus = () => {
  const { benefits, usage, loading } = usePassBenefits();

  if (loading) {
    return (
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const passDetails = getPassDetails(benefits.currentPass);
  const chatProgress = benefits.hasUnlimitedChats ? 100 : (usage.chatsUsed / benefits.chatLimit) * 100;
  const listingProgress = benefits.hasUnlimitedListings ? 100 : (usage.listingsUsed / benefits.listingLimit) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Current Pass */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Current Plan</CardTitle>
            {benefits.currentPass !== 'free' && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Crown className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${passDetails.color} flex items-center justify-center`}>
              <passDetails.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{passDetails.name}</h3>
              <p className="text-sm text-muted-foreground">
                {passDetails.price > 0 ? `₹${passDetails.price}/${passDetails.period}` : 'Free forever'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chat Usage */}
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Used</span>
                <span className="font-medium">
                  {benefits.hasUnlimitedChats ? (
                    `${usage.chatsUsed} (Unlimited)`
                  ) : (
                    `${usage.chatsUsed} / ${benefits.chatLimit}`
                  )}
                </span>
              </div>
              <Progress 
                value={chatProgress} 
                className="h-2"
              />
              {!benefits.hasUnlimitedChats && usage.chatsUsed >= benefits.chatLimit && (
                <p className="text-xs text-amber-600">
                  Chat limit reached.
                </p>
              )}
              {!benefits.hasUnlimitedChats && usage.chatsUsed >= benefits.chatLimit * 0.8 && usage.chatsUsed < benefits.chatLimit && (
                <p className="text-xs text-amber-600">
                  Running low on chats.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Listing Usage */}
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-4 h-4" />
              Listing Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Used</span>
                <span className="font-medium">
                  {benefits.hasUnlimitedListings ? (
                    `${usage.listingsUsed} (Unlimited)`
                  ) : (
                    `${usage.listingsUsed} / ${benefits.listingLimit}`
                  )}
                </span>
              </div>
              <Progress 
                value={listingProgress} 
                className="h-2"
              />
              {!benefits.hasUnlimitedListings && usage.listingsUsed >= benefits.listingLimit && (
                <p className="text-xs text-amber-600">
                  Listing limit reached.
                </p>
              )}
              {!benefits.hasUnlimitedListings && usage.listingsUsed >= benefits.listingLimit * 0.8 && usage.listingsUsed < benefits.listingLimit && (
                <p className="text-xs text-amber-600">
                  Running low on listing slots.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${benefits.hasSellerContactAccess ? 'bg-green-500' : 'bg-muted'}`} />
              <span className={benefits.hasSellerContactAccess ? 'text-foreground' : 'text-muted-foreground'}>
                Seller Contact Access
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${benefits.hasEarlyAccess ? 'bg-green-500' : 'bg-muted'}`} />
              <span className={benefits.hasEarlyAccess ? 'text-foreground' : 'text-muted-foreground'}>
                Early Access
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${benefits.hasVerifiedBadge ? 'bg-green-500' : 'bg-muted'}`} />
              <span className={benefits.hasVerifiedBadge ? 'text-foreground' : 'text-muted-foreground'}>
                Verified Badge
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${benefits.hasPrioritySearch ? 'bg-green-500' : 'bg-muted'}`} />
              <span className={benefits.hasPrioritySearch ? 'text-foreground' : 'text-muted-foreground'}>
                Priority Search
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PassStatus;