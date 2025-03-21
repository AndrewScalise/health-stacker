import React from "react";
import { Button } from "../ui/button";

/**
 * Reusable page header component with title, description, and optional actions
 */
const PageHeader = ({
  title,
  description,
  action, // Optional action button config { label, icon, onClick }
  children, // Optional additional content
}) => {
  return (
    <div className="mb-6 border-b border-gray-200 pb-5">
      <div className="flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>

        {action && (
          <Button className="mt-3 sm:mt-0 gap-1.5" onClick={action.onClick}>
            {action.icon && action.icon}
            {action.label}
          </Button>
        )}

        {children && (
          <div className="w-full mt-4 flex items-center justify-between">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
