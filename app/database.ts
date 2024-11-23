export interface KeyTTL {
  value: number;
  unit: "seconds" | "milliseconds";
}

export interface Database {
  [key: string]: {
    value: string | null;
    createdAt: number;
    ttl?: KeyTTL;
  };
}

