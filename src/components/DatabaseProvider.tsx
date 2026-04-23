import React, { ReactNode } from 'react';

interface Props { children: ReactNode; }

export function DatabaseProvider({ children }: Props) {
  return <>{children}</>;
}
