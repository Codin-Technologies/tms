"use client";

import React from "react";

interface RequireRoleProps {
  allowedRoles: string[];
  currentRole?: string;
  children: React.ReactNode;
}

export default function RequireRole({ allowedRoles, currentRole = 'ADMIN', children }: RequireRoleProps) {
  // NOTE: Replace currentRole default with real session role when wiring up auth
  if (!allowedRoles.includes(currentRole)) return null;
  return <>{children}</>;
}
