import React from "react";
import { Button } from "../ui/button";

/**
 * Reusable empty state component for when there's no data to display
 */
const EmptyState = ({
  title,
  description,
  icon: Icon,
  actionText,
  onAction,
  className,
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center 
        rounded-lg border border-dashed border-gray-300 
        bg-white p-8 text-center
        ${className || ""}
      `}
    >
      {Icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Icon className="h-6 w-6 text-gray-600" />
        </div>
      )}

      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>

      <p className="mt-1 text-sm text-gray-500">{description}</p>

      {actionText && onAction && (
        <Button className="mt-4" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
