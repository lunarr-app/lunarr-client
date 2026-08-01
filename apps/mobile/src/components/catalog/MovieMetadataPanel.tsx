import { InfoText } from "@/src/components/layout/InfoText";
import { SettingsSection } from "@/src/components/settings/SettingsSection";
import type { MovieDetailRecord } from "@lunarr/api";
import { formatDuration, formatFileSize, formatVoteCount } from "@lunarr/core";
import { darkColors } from "@/src/theme/colors";
import { scaleNum } from "@/src/theme/scale";
import { radii, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { StyleSheet, Text, View } from "react-native";

type MovieFacts = Pick<
  MovieDetailRecord,
  | "release_date"
  | "year"
  | "runtime_seconds"
  | "vote_average"
  | "vote_count"
  | "certification"
  | "status"
  | "original_language"
  | "provider"
  | "provider_id"
  | "collection_name"
>;

type Props = {
  movie: MovieFacts;
  directors: string[];
  writers: string[];
  keywords: string[];
  productionCompanies: string[];
  fileCount: number;
  totalSizeBytes: number;
};

const rowGap = { gap: 2 } as const;

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={rowGap}>
      <InfoText variant="label">{label}</InfoText>
      <InfoText variant="value">{value}</InfoText>
    </View>
  );
}

export function MovieMetadataPanel({
  movie,
  directors,
  writers,
  keywords,
  productionCompanies,
  fileCount,
  totalSizeBytes,
}: Props) {
  const ratingLabel =
    movie.vote_average === null || movie.vote_average === undefined ? null : Number(movie.vote_average).toFixed(1);
  const voteCountLabel = formatVoteCount(movie.vote_count);
  const runtimeLabel = movie.runtime_seconds ? formatDuration(movie.runtime_seconds) : null;
  const releaseLabel = movie.release_date ?? (movie.year ? String(movie.year) : null);
  const providerLabel = movie.provider ? movie.provider.toUpperCase() : "Local";

  return (
    <View style={styles.wrap}>
      <SettingsSection title="Metadata">
        <View style={styles.sectionBody}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreValue}>{ratingLabel ?? "-"}</Text>
              <Text style={styles.scoreLabel}>{voteCountLabel ? `${voteCountLabel} votes` : "Unrated"}</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreValue}>{movie.certification ?? "NR"}</Text>
              <Text style={styles.scoreLabel}>{movie.status ?? "Unknown status"}</Text>
            </View>
          </View>

          <View style={styles.chips}>
            <Text style={styles.chip}>{providerLabel}</Text>
            {releaseLabel ? <Text style={styles.chip}>{releaseLabel}</Text> : null}
            {runtimeLabel ? <Text style={styles.chip}>{runtimeLabel}</Text> : null}
            {movie.original_language ? <Text style={styles.chip}>{movie.original_language.toUpperCase()}</Text> : null}
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Credits</Text>
            <MetadataRow label="Director" value={directors.join(", ") || "Unknown"} />
            <MetadataRow label="Writers" value={writers.join(", ") || "Unknown"} />
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Library</Text>
            <MetadataRow label="Files" value={`${fileCount} ${fileCount === 1 ? "file" : "files"}`} />
            <MetadataRow label="Total size" value={formatFileSize(totalSizeBytes)} />
            <MetadataRow label="Provider ID" value={movie.provider_id ?? "None"} />
          </View>

          {movie.collection_name || productionCompanies.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Production</Text>
              <MetadataRow label="Collection" value={movie.collection_name ?? "None"} />
              {productionCompanies.length > 0 ? (
                <MetadataRow label="Studios" value={productionCompanies.join(", ")} />
              ) : null}
            </View>
          ) : null}

          {keywords.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Keywords</Text>
              <View style={styles.chips}>
                {keywords.map((keyword) => (
                  <Text key={keyword} style={styles.keyword}>
                    {keyword}
                  </Text>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </SettingsSection>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  sectionBody: { padding: spacing.md, gap: spacing.sm },
  scoreRow: { flexDirection: "row", gap: spacing.sm },
  scoreBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: radii.card,
    backgroundColor: darkColors.card,
    gap: 2,
    padding: spacing.md,
  },
  scoreValue: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.heavy,
    lineHeight: scaleNum(32),
    fontSize: typography.fontSize.page,
  },
  scoreLabel: { color: darkColors.muted, fontSize: typography.fontSize.meta },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: darkColors.border,
    backgroundColor: darkColors.card,
    color: darkColors.textSoft,
    fontWeight: typography.fontWeight.bold,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.fontSize.caption,
  },
  keyword: {
    borderRadius: radii.pill,
    backgroundColor: darkColors.card,
    color: darkColors.textSoft,
    fontWeight: typography.fontWeight.bold,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.fontSize.caption,
  },
  block: { paddingTop: spacing.sm, gap: spacing.sm },
  blockTitle: {
    color: darkColors.muted,
    fontWeight: typography.fontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontSize: typography.fontSize.body,
  },
});
