import { ConfigPlugin } from "expo/config-plugins";

interface LunarrPlayerOptions {
  podName?: string;
  podspecUrl?: string;
}

declare const withLunarrPlayer: ConfigPlugin<LunarrPlayerOptions | undefined>;
export default withLunarrPlayer;