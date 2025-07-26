import React from 'react';
import { WorkerProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Full WorkerProfile support
interface SimpleWorkerCardProps {
  worker: WorkerProfile;
  onViewProfile?: () => void;
  onContact?: () => void;
}

const SimpleWorkerCard: React.FC<SimpleWorkerCardProps> = ({ worker, onViewProfile, onContact }) => {
  return (
    <Card className="w-full max-w-sm h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={worker.photoUrl} 
              alt={`${worker.firstName} ${worker.lastName}`} 
            />
            <AvatarFallback>
              {worker.firstName?.[0] || 'W'}
              {worker.lastName?.[0] || ''}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-foreground truncate">
              {`${worker.firstName || ''} ${worker.lastName || ''}`.trim() || 'No Name'}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              Worker
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col">
        {/* Skills/Trades Section */}
        {worker.tradeTags && worker.tradeTags.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-foreground mb-2">Trades</h4>
            <div className="flex flex-wrap gap-1">
              {worker.tradeTags.slice(0, 3).map((trade, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {trade}
                </Badge>
              ))}
              {worker.tradeTags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{worker.tradeTags.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        {worker.location && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              📍 {worker.location.city}, {worker.location.province}
            </p>
          </div>
        )}

        {/* Preferred Rate */}
        {worker.preferredRate && (
          <div className="mb-4">
            <p className="text-sm font-medium text-foreground">
              💰 ${worker.preferredRate}/hour
            </p>
          </div>
        )}

        {/* Bio/Description */}
        {worker.bio && (
          <div className="mb-4 flex-1">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {worker.bio}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onViewProfile}
          >
            View Profile
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={onContact}
          >
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleWorkerCard;
