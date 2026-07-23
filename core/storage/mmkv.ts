import { createMMKV, type MMKV } from "react-native-mmkv";

export type JSONStore = {
  read<T>(key: string): T | null;
  write<T>(key: string, value: T): void;
  remove(key: string): void;
};

// MMKV instance.
export function createJSONStore(id: string): JSONStore {
  const storage: MMKV = createMMKV({ id });

  return {
    read<T>(key: string): T | null {
      const raw = storage.getString(key);
      if (raw === undefined) {
        return null;
      }
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },
    write<T>(key: string, value: T): void {
      storage.set(key, JSON.stringify(value));
    },
    remove(key: string): void {
      storage.remove(key);
    },
  };
}
