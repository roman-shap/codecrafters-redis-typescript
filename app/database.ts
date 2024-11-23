export interface KeyTTL {
  value: number;
  unit: "seconds" | "milliseconds";
}

type Key = string;
type Value = string | null;

type KeyMetadata = {
  createdAt: number;
  ttl?: KeyTTL;
};

export type Config = {
  dir?: string;
  dbfilename?: string;
};

export class Database extends Map<Key, Value> {
  config: Config = {};
  private metadata: Map<Key, KeyMetadata> = new Map();

  constructor(config: Config) {
    super();
    this.config = config;
  }

  public get(key: Key): Value {
    this.expireKey(key);
    return super.get(key) || null;
  }

  public set(key: Key, value: Value, ttl?: KeyTTL): this {
    this.expireKey(key);
    const now = Date.now();
    super.set(key, value);
    this.metadata.set(key, { createdAt: Date.now(), ttl });
    console.log(`${now}: Created key ${key} with value ${value}, ttl: ${ttl?.value} ${ttl?.unit}`);
    return this;
  }

  private expireKey(key: Key): void {
    const metadata = this.metadata.get(key);
    if (metadata &&
      metadata.ttl?.unit === "milliseconds" &&
      Date.now() - metadata.createdAt > metadata.ttl.value) {
      this.delete(key);
      this.metadata.delete(key);
    }
  };
}

