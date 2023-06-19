import { atom } from "jotai";
import type { ModelsUserAccounts } from "@backend/api/lunarr";

export const userAtom = atom<ModelsUserAccounts | null>(null);
