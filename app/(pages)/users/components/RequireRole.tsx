"use client";

import React from "react";

interface RequireRoleProps {
  allowedRoles: string[];
  currentRole?: string;
  children: React.ReactNode;
}

export default function RequireRole({ allowedRoles, currentRole = 'ADMIN', children }: RequireRoleProps) {
  // Case-insensitive comparison for robustness
  const isAllowed = allowedRoles.some(role =>
    role.toUpperCase() === (currentRole?.toUpperCase() || '')
  );

  if (!isAllowed) return null;
  return <>{children}</>;
}
