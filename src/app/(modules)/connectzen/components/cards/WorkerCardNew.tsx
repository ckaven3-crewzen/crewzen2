import React from 'react';
import { WorkerProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface WorkerCardProps {
  worker: WorkerProfile;
  onViewProfile?: () => void;
  onContact?: () => void;
}

const WorkerCardNew: React.FC<WorkerCardProps> = ({ worker, onViewProfile, onContact }) => {
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
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-base text-foreground truncate">
                {`${worker.firstName || ''} ${worker.lastName || ''}`.trim() || 'No Name'}
              </h3>
              {/* Availability Status Badge */}
              <Badge 
                variant={
                  worker.availability === 'available' 
                    ? "default" 
                    : worker.availability === 'working'
                    ? "destructive"
                    : worker.availability === 'busy'
                    ? "secondary"
                    : "outline"
                }
                className="text-xs"
              >
                {worker.availability === 'available' ? "Available" :
                 worker.availability === 'working' ? "Working" : 
                 worker.availability === 'busy' ? "Busy" : 
                 worker.availability === 'not_looking' ? "Not Looking" : "Available"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {worker.tradeTags?.join(', ') || 'Worker'}
            </p>
            {/* 5-Star Rating System */}
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const rating = worker.averageRating || 0;
                return (
                  <Star 
                    key={star}
                    className={`h-4 w-4 ${
                      star <= rating 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-gray-300'
                    }`}
                  />
                );
              })}
              <span className="ml-1 text-xs text-muted-foreground">
                {worker.averageRating ? (
                  `(${worker.averageRating.toFixed(1)})`
                ) : (
                  <span className="text-blue-600 font-medium">New</span>
                )}
              </span>
            </div>
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

export default WorkerCardNew;
