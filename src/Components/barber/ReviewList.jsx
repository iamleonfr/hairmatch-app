import React from "react";
import { Card, CardContent } from "../ui/card";
import { Star, User } from "lucide-react";
import { format } from "date-fns";

export default function ReviewList({ reviews, isLoading }) {
  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading reviews...</div>;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="border-2 border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{review.user_name}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(review.created_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.service_used && (
                  <p className="text-sm text-orange-600 mb-2">Service: {review.service_used}</p>
                )}
                <p className="text-gray-700">{review.comment}</p>
                {review.photos?.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {review.photos.map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt="Review"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}