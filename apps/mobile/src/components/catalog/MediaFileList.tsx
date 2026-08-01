import { mediaFileLabel, type MediaFileLike } from "@lunarr/core";
import { mediaFileProgressLabel, type MediaFileProgress } from "@lunarr/core";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";

type Props<T extends MediaFileLike> = {
  files: T[];
  progressByFile: Map<string, MediaFileProgress>;
  primaryFileId?: string | null;
  formatDetails: (file: T) => string;
  onPlay: (file: T) => void;
  onToggleWatched: (file: T, completed: boolean) => void;
  showFeaturedBadge?: boolean;
  bordered?: boolean;
};

export function MediaFileList<T extends MediaFileLike>({
  files,
  progressByFile,
  primaryFileId,
  formatDetails,
  onPlay,
  onToggleWatched,
  showFeaturedBadge = false,
  bordered = true,
}: Props<T>) {
  return (
    <View style={[styles.list, !bordered && styles.listFlat]}>
      {files.map((file, index) => {
        const fileProgress = progressByFile.get(file.id);
        const isWatched = Boolean(fileProgress?.completed);
        const details = formatDetails(file);
        const isFeatured = files.length > 1 && showFeaturedBadge && primaryFileId === file.id;
        const isLast = index === files.length - 1;
        const showFileActions = files.length > 1;

        return (
          <View
            key={file.id}
            style={[
              bordered ? [styles.fileRow] : [styles.fileRowFlat],
              isFeatured && bordered && styles.fileRowFeatured,
              !bordered && !isLast && styles.fileRowFlatSeparator,
            ]}
          >
            <View style={styles.fileCopy}>
              <View style={styles.fileTitleRow}>
                <Text style={styles.fileTitle}>{mediaFileLabel(file)}</Text>
                {isFeatured ? <Text style={styles.fileBadge}>Selected</Text> : null}
              </View>
              {details ? <Text style={styles.fileMeta}>{details}</Text> : null}
              <Text style={[styles.fileStatus, isWatched && styles.fileStatusWatched]}>
                {mediaFileProgressLabel(fileProgress)}
              </Text>
            </View>
            {showFileActions ? (
              <View style={styles.fileActions}>
                <Button compact mode="contained" onPress={() => onPlay(file)}>
                  Play
                </Button>
                <Button compact mode="outlined" onPress={() => onToggleWatched(file, !isWatched)}>
                  {isWatched ? "Unwatch" : "Watched"}
                </Button>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  listFlat: { gap: 0 },
  fileRow: {
    backgroundColor: darkColors.surfaceStrong,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: darkColors.border,
    gap: spacing.md,
    padding: spacing.md,
  },
  fileRowFlat: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  fileRowFlatSeparator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: darkColors.border,
  },
  fileRowFeatured: {
    borderColor: darkColors.accentBorder,
  },
  fileCopy: {
    gap: spacing.xs,
  },
  fileTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  fileTitle: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.bold,
    flexShrink: 1,
    fontSize: typography.fontSize.body,
  },
  fileBadge: {
    color: darkColors.accent,
    fontWeight: typography.fontWeight.heavy,
    fontSize: typography.fontSize.caption,
  },
  fileMeta: {
    color: darkColors.muted,
    fontSize: typography.fontSize.meta,
    lineHeight: typography.lineHeight.small,
  },
  fileStatus: {
    color: darkColors.accent,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.meta,
  },
  fileStatusWatched: { color: darkColors.success },
  fileActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
