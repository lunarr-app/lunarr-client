import { CastRailSkeleton } from "@/src/components/catalog/CastRailSkeleton";
import { PosterGridCardSkeleton } from "@/src/components/catalog/CatalogCardSkeleton";
import { CatalogFlexGridSkeleton, PosterFlexGrid, PosterFlexGridCell } from "@/src/components/catalog/PosterFlexGrid";
import { SeasonEpisodeListSkeleton } from "@/src/components/catalog/SeasonEpisodeListSkeleton";
import { SeasonTabsSkeleton } from "@/src/components/catalog/SeasonTabsSkeleton";
import { ScreenScrollView } from "@/src/components/layout/ScreenScrollView";
import { Skeleton } from "@/src/components/layout/Skeleton";
import { useDeviceTier } from "@/src/lib/layout/responsive";
import { darkColors } from "@/src/theme/colors";
import { detailContentInset, detailHeroOverlayInset, radii, spacing } from "@/src/theme/spacing";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BodyVariant = "files" | "seasons" | "episodes" | "none";

type Props = {
  wrapScreen?: boolean;
  bodyVariant?: BodyVariant;
  showCastRail?: boolean;
  listRows?: number;
  showCreditGrids?: boolean;
  heroHeaderMode?: boolean;
};

function MediaHeroSkeleton({ heroHeaderMode = false }: { heroHeaderMode?: boolean }) {
  const insets = useSafeAreaInsets();
  const isWide = useDeviceTier() !== "phone";

  if (isWide) {
    return (
      <View style={[styles.heroWide, heroHeaderMode && styles.heroMediaHeaderMode]}>
        <View style={[styles.heroWideInner, { paddingTop: heroHeaderMode ? insets.top + spacing.md : spacing.xl }]}>
          {heroHeaderMode ? <Skeleton height={44} width={44} borderRadius={radii.pill} /> : null}
          <View style={styles.heroWideRow}>
            <Skeleton height={396} width={264} borderRadius={radii.card} />
            <View style={styles.heroWideContent}>
              <Skeleton height={28} width="60%" borderRadius={radii.control} />
              <View style={styles.genres}>
                <Skeleton height={26} width={64} borderRadius={radii.pill} />
                <Skeleton height={26} width={72} borderRadius={radii.pill} />
              </View>
              <View style={styles.facts}>
                <Skeleton height={24} width={72} borderRadius={radii.pill} />
                <Skeleton height={24} width={84} borderRadius={radii.pill} />
                <Skeleton height={24} width={56} borderRadius={radii.pill} />
              </View>
              <Skeleton height={20} width="92%" borderRadius={radii.control} />
              <Skeleton height={20} width="84%" borderRadius={radii.control} />
              <Skeleton height={20} width="66%" borderRadius={radii.control} />
              <View style={styles.actions}>
                <Skeleton height={36} width={140} borderRadius={radii.control} />
                <Skeleton height={36} width={120} borderRadius={radii.control} />
                <Skeleton height={36} width={120} borderRadius={radii.control} />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.heroMedia, heroHeaderMode && styles.heroMediaHeaderMode]}>
      <View style={styles.coverSkeleton}>
        {heroHeaderMode ? (
          <View style={[styles.coverTop, { paddingTop: insets.top + spacing.md }]}>
            <Skeleton height={44} width={44} borderRadius={radii.pill} style={styles.backSkeleton} />
          </View>
        ) : null}
        <View style={styles.coverSpacer} />
        <View style={styles.coverFooterSkeleton}>
          <Skeleton height={28} width="88%" borderRadius={radii.control} />
          <View style={styles.genres}>
            <Skeleton height={26} width={64} borderRadius={radii.pill} />
            <Skeleton height={26} width={72} borderRadius={radii.pill} />
          </View>
          <View style={styles.facts}>
            <Skeleton height={24} width={72} borderRadius={radii.pill} />
            <Skeleton height={24} width={84} borderRadius={radii.pill} />
            <Skeleton height={24} width={56} borderRadius={radii.pill} />
          </View>
          <Skeleton height={20} width="100%" borderRadius={radii.control} />
          <Skeleton height={20} width="96%" borderRadius={radii.control} />
          <Skeleton height={20} width="78%" borderRadius={radii.control} />
          <Skeleton height={46} width="100%" borderRadius={radii.control} />
          <View style={styles.actions}>
            <Skeleton height={36} width="32%" borderRadius={radii.control} style={styles.actionFlex} />
            <Skeleton height={36} width="32%" borderRadius={radii.control} style={styles.actionFlex} />
            <Skeleton height={36} width="32%" borderRadius={radii.control} style={styles.actionFlex} />
          </View>
          <Skeleton height={5} width="100%" borderRadius={radii.pill} />
        </View>
      </View>
    </View>
  );
}

function FileRowSkeleton() {
  return (
    <View style={styles.fileRow}>
      <View style={styles.fileCopy}>
        <Skeleton height={16} width="70%" borderRadius={radii.control} />
        <Skeleton height={13} width="85%" borderRadius={radii.control} />
        <Skeleton height={13} width="40%" borderRadius={radii.control} />
      </View>
      <View style={styles.rowActions}>
        <Skeleton height={36} width={72} borderRadius={radii.control} />
        <Skeleton height={36} width={88} borderRadius={radii.control} />
      </View>
    </View>
  );
}

function CreditGridSkeleton({ variant }: { variant: "movie" | "show" }) {
  return (
    <View style={styles.section}>
      <Skeleton height={18} width={120} borderRadius={radii.control} />
      <PosterFlexGrid kind={variant}>
        {Array.from({ length: 4 }).map((_, index) => (
          <PosterFlexGridCell key={index}>
            <View style={styles.creditItem}>
              <PosterGridCardSkeleton variant={variant} includeProgress={false} />
              <Skeleton height={13} width="88%" borderRadius={radii.control} />
            </View>
          </PosterFlexGridCell>
        ))}
      </PosterFlexGrid>
    </View>
  );
}

function SeasonGridSkeleton() {
  return (
    <View style={styles.body}>
      <View style={styles.sectionHeader}>
        <Skeleton height={18} width={72} borderRadius={radii.control} />
        <Skeleton height={14} width={220} borderRadius={radii.control} />
      </View>
      <CatalogFlexGridSkeleton kind="show" count={4} />
    </View>
  );
}

export function DetailScreenSkeleton({
  wrapScreen = false,
  bodyVariant = "files",
  showCastRail = true,
  listRows = 0,
  showCreditGrids = false,
  heroHeaderMode = false,
}: Props) {
  return (
    <ScreenScrollView wrapScreen={wrapScreen}>
      <MediaHeroSkeleton heroHeaderMode={heroHeaderMode} />

      {bodyVariant === "files" ? (
        <View style={styles.body}>
          <Skeleton height={18} width={56} borderRadius={radii.control} />
          <View style={styles.list}>
            {Array.from({ length: 2 }).map((_, index) => (
              <FileRowSkeleton key={index} />
            ))}
          </View>
        </View>
      ) : null}

      {bodyVariant === "seasons" ? <SeasonGridSkeleton /> : null}

      {bodyVariant === "episodes" ? (
        <View style={styles.body}>
          <SeasonTabsSkeleton />
          <SeasonEpisodeListSkeleton rows={listRows > 0 ? listRows : 5} />
        </View>
      ) : null}

      {showCreditGrids ? (
        <>
          <CreditGridSkeleton variant="movie" />
          <CreditGridSkeleton variant="show" />
        </>
      ) : null}

      {showCastRail ? <CastRailSkeleton /> : null}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  heroMedia: {
    marginHorizontal: -spacing.md,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  heroMediaHeaderMode: {
    marginTop: 0,
  },
  heroWide: {
    marginBottom: spacing.lg,
    overflow: "hidden",
    backgroundColor: darkColors.bg,
  },
  heroWideInner: {
    paddingHorizontal: detailHeroOverlayInset,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  heroWideRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xl,
  },
  heroWideContent: {
    flex: 1,
    gap: spacing.sm,
  },
  coverSkeleton: {
    width: "100%",
    aspectRatio: 2 / 3,
    justifyContent: "flex-start",
    backgroundColor: darkColors.surfaceFaint,
  },
  coverTop: {
    paddingHorizontal: detailHeroOverlayInset,
  },
  backSkeleton: {
    marginLeft: 0,
  },
  coverSpacer: {
    flex: 1,
  },
  coverFooterSkeleton: {
    gap: spacing.sm,
    paddingHorizontal: detailHeroOverlayInset,
    paddingBottom: spacing.lg,
  },
  facts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  genres: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
    alignSelf: "stretch",
  },
  actionFlex: {
    flex: 1,
  },
  body: {
    gap: spacing.lg,
    paddingHorizontal: detailContentInset,
    paddingBottom: spacing.lg,
  },
  sectionHeader: { gap: 2 },
  list: { gap: spacing.md },
  fileRow: {
    gap: spacing.md,
    backgroundColor: "transparent",
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: darkColors.border,
    padding: spacing.md,
  },
  fileCopy: { gap: spacing.xs },
  rowActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
    paddingHorizontal: detailContentInset,
    paddingBottom: spacing.xl,
  },
  creditItem: { gap: spacing.xs },
});
