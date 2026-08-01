import { mediaFileLabel, type MediaFileLike } from "@/src/lib/media/files";
import { mediaFileProgressLabel, type MediaFileProgress } from "@/src/lib/media/progress";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/Button";

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
  const { scale } = useTVScale();

  const listStyle = bordered ? { gap: spacing.md * scale } : undefined;
  const fileRowStyle = {
    gap: spacing.lg * scale,
    borderRadius: radii.card * scale,
    borderWidth: Math.max(1, 2 * scale),
    padding: spacing.lg * scale,
  };
  const fileRowFlatStyle = { gap: spacing.lg * scale, paddingVertical: spacing.lg * scale };
  const fileRowFlatSeparatorStyle = { borderBottomWidth: Math.max(1, 2 * scale) };
  const fileCopyStyle = { gap: spacing.xs * scale };
  const fileTitleRowStyle = { gap: spacing.sm * scale };
  const fileTitleStyle = { fontSize: typography.fontSize.title * scale };
  const fileBadgeStyle = { fontSize: typography.fontSize.body * scale };
  const fileMetaStyle = {
    fontSize: typography.fontSize.body * scale,
    lineHeight: typography.lineHeight.normal * scale,
  };
  const fileStatusStyle = { fontSize: typography.fontSize.body * scale };
  const fileActionsStyle = { gap: spacing.md * scale };

  return (
    <View style={[styles.list, listStyle, !bordered && styles.listFlat]}>
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
              bordered ? styles.fileRow : styles.fileRowFlat,
              bordered ? fileRowStyle : fileRowFlatStyle,
              isFeatured && bordered && styles.fileRowFeatured,
              !bordered && !isLast && styles.fileRowFlatSeparator,
              !bordered && !isLast && fileRowFlatSeparatorStyle,
            ]}
          >
            <View style={[styles.fileCopy, fileCopyStyle]}>
              <View style={[styles.fileTitleRow, fileTitleRowStyle]}>
                <Text style={[styles.fileTitle, fileTitleStyle]}>{mediaFileLabel(file)}</Text>
                {isFeatured ? <Text style={[styles.fileBadge, fileBadgeStyle]}>Selected</Text> : null}
              </View>
              {details ? <Text style={[styles.fileMeta, fileMetaStyle]}>{details}</Text> : null}
              <Text style={[styles.fileStatus, fileStatusStyle, isWatched && styles.fileStatusWatched]}>
                {mediaFileProgressLabel(fileProgress)}
              </Text>
            </View>
            {showFileActions ? (
              <View style={[styles.fileActions, fileActionsStyle]}>
                <Button mode="contained" onPress={() => onPlay(file)}>
                  Play
                </Button>
                <Button mode="outlined" onPress={() => onToggleWatched(file, !isWatched)}>
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
  list: {},
  listFlat: { gap: 0 },
  fileRow: {
    backgroundColor: darkColors.surfaceStrong,
    borderColor: darkColors.border,
  },
  fileRowFlat: {},
  fileRowFlatSeparator: {
    borderBottomColor: darkColors.border,
  },
  fileRowFeatured: {
    borderColor: darkColors.accentBorder,
  },
  fileCopy: {},
  fileTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  fileTitle: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
    flexShrink: 1,
  },
  fileBadge: {
    color: darkColors.accent,
    fontWeight: typography.fontWeight.bold,
  },
  fileMeta: {
    color: darkColors.muted,
  },
  fileStatus: {
    color: darkColors.accent,
    fontWeight: typography.fontWeight.semibold,
  },
  fileStatusWatched: { color: darkColors.success },
  fileActions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
