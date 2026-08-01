import { heroChipBg, heroChipBorder } from "@/src/components/catalog/HeroFactChip";
import { useDeviceTier } from "@/src/lib/layout/responsive";
import { darkColors } from "@/src/theme/colors";
import { scaleNum } from "@/src/theme/scale";
import { detailHeroOverlayInset, radii, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { ChevronLeft } from "lucide-react-native";
import { ReactNode } from "react";
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BACKDROP_ASPECT = 16 / 9;
const POSTER_ASPECT = 2 / 3;

type ContentPlacement = "overlay" | "below";

type Props = {
  title: string;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  overview: string | null;
  year?: number | null;
  genres?: string[];
  eyebrow?: string | null;
  onEyebrowPress?: () => void;
  eyebrowSecondary?: string | null;
  onEyebrowSecondaryPress?: () => void;
  facts?: ReactNode;
  actions?: ReactNode;
  below?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  contentPlacement?: ContentPlacement;
  overviewFallback?: string | false;
};

export function MediaHero({
  title,
  posterUrl = null,
  backdropUrl = null,
  overview,
  year = null,
  genres = [],
  eyebrow,
  onEyebrowPress,
  eyebrowSecondary,
  onEyebrowSecondaryPress,
  facts,
  actions,
  below,
  onBack,
  backLabel,
  contentPlacement = "overlay",
  overviewFallback = "No overview available.",
}: Props) {
  const insets = useSafeAreaInsets();
  const isWide = useDeviceTier() !== "phone";
  const headerMode = onBack != null;
  const usingPoster = posterUrl != null;
  const coverUrl = posterUrl ?? backdropUrl;
  const coverAspect = usingPoster ? POSTER_ASPECT : BACKDROP_ASPECT;
  const contentBelowCover = contentPlacement === "below";
  const overviewText =
    overview?.trim() || (overviewFallback === false ? null : (overviewFallback ?? "No overview available."));
  const overviewLines = contentBelowCover || isWide ? undefined : usingPoster ? 5 : 3;

  const heroContent = (
    <>
      {eyebrow || eyebrowSecondary ? (
        <View style={styles.eyebrowRow}>
          {eyebrow ? (
            onEyebrowPress ? (
              <Pressable onPress={onEyebrowPress} hitSlop={4}>
                <Text style={styles.eyebrow}>{eyebrow}</Text>
              </Pressable>
            ) : (
              <Text style={styles.eyebrow}>{eyebrow}</Text>
            )
          ) : null}
          {eyebrow && eyebrowSecondary ? <Text style={styles.eyebrow}>·</Text> : null}
          {eyebrowSecondary ? (
            onEyebrowSecondaryPress ? (
              <Pressable onPress={onEyebrowSecondaryPress} hitSlop={4}>
                <Text style={styles.eyebrow}>{eyebrowSecondary}</Text>
              </Pressable>
            ) : (
              <Text style={styles.eyebrow}>{eyebrowSecondary}</Text>
            )
          ) : null}
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {year != null || genres.length > 0 || facts != null ? (
        <View style={styles.metaRow}>
          {year != null ? <Text style={styles.genre}>{year}</Text> : null}
          {genres.map((genre) => (
            <Text key={genre} style={styles.genre}>
              {genre}
            </Text>
          ))}
          {facts}
        </View>
      ) : null}
      {overviewText ? (
        <Text style={styles.overview} numberOfLines={overviewLines}>
          {overviewText}
        </Text>
      ) : null}
      {actions ? <View style={styles.actions}>{actions}</View> : null}
      {below ? <View style={styles.below}>{below}</View> : null}
    </>
  );

  const backButton = onBack ? (
    <Pressable
      onPress={onBack}
      style={styles.backButton}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={backLabel ? `Back to ${backLabel}` : "Go back"}
    >
      <ChevronLeft color={darkColors.text} size={22} strokeWidth={2.5} />
    </Pressable>
  ) : null;

  if (isWide && usingPoster) {
    return (
      <View style={[styles.heroWide, headerMode && styles.heroHeaderMode]}>
        {coverUrl ? (
          <ImageBackground source={{ uri: coverUrl }} style={StyleSheet.absoluteFill} resizeMode="cover">
            <View style={styles.heroWideScrim} />
          </ImageBackground>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.fallbackBg]} />
        )}
        <View style={[styles.heroWideInner, { paddingTop: headerMode ? insets.top + spacing.md : spacing.xl }]}>
          {backButton}
          <View style={styles.heroWideRow}>
            <View style={styles.heroWidePoster}>
              <Image source={{ uri: posterUrl ?? undefined }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            </View>
            <View style={styles.heroWideContent}>{heroContent}</View>
          </View>
        </View>
      </View>
    );
  }

  if (isWide && contentBelowCover) {
    return (
      <View style={[styles.heroWideBackdrop, headerMode && styles.heroHeaderMode]}>
        <View style={styles.heroWideBackdropCover}>
          {coverUrl ? (
            <ImageBackground source={{ uri: coverUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.fallbackBg]} />
          )}
          {backButton ? (
            <View style={[styles.heroWideBackdropBack, { top: insets.top + spacing.md }]}>{backButton}</View>
          ) : null}
        </View>
        <View style={styles.heroWideBackdropBody}>{heroContent}</View>
      </View>
    );
  }

  return (
    <View style={[styles.hero, headerMode && styles.heroHeaderMode]}>
      <View style={[styles.cover, { aspectRatio: coverAspect }]}>
        {coverUrl ? (
          <ImageBackground source={{ uri: coverUrl }} style={StyleSheet.absoluteFill} resizeMode="cover">
            <LinearGradient
              colors={["rgba(8,12,17,0.55)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 0.3 }}
              style={StyleSheet.absoluteFill}
            />
          </ImageBackground>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.fallbackBg]} />
        )}

        {contentBelowCover ? null : (
          <LinearGradient
            colors={["transparent", "rgba(8,12,17,0.75)", "rgba(8,12,17,0.98)"]}
            locations={[0, 0.35, 1]}
            style={[
              styles.coverBottomGradient,
              usingPoster ? styles.coverBottomGradientPoster : styles.coverBottomGradientBackdrop,
            ]}
            pointerEvents="none"
          />
        )}

        <View
          style={[
            styles.coverOverlay,
            headerMode ? { paddingTop: insets.top + spacing.md } : { paddingTop: spacing.lg },
            contentBelowCover && styles.coverOverlayImageOnly,
          ]}
        >
          {backButton}
          {contentBelowCover ? null : (
            <>
              <View style={styles.coverSpacer} />
              <View style={styles.coverContent}>{heroContent}</View>
            </>
          )}
        </View>
      </View>
      {contentBelowCover ? <View style={styles.belowCover}>{heroContent}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: -spacing.md,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
    overflow: "hidden",
    backgroundColor: darkColors.bg,
  },
  heroHeaderMode: {
    marginTop: 0,
  },
  heroWide: {
    marginBottom: spacing.lg,
    overflow: "hidden",
    backgroundColor: darkColors.bg,
  },
  heroWideScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(8,12,17,0.72)",
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
  heroWidePoster: {
    width: scaleNum(264),
    aspectRatio: POSTER_ASPECT,
    borderRadius: radii.card,
    overflow: "hidden",
    backgroundColor: darkColors.bgSoft,
  },
  heroWideContent: {
    flex: 1,
    gap: spacing.sm,
  },
  heroWideBackdrop: {
    marginBottom: spacing.lg,
    backgroundColor: darkColors.bg,
  },
  heroWideBackdropCover: {
    height: scaleNum(420),
    backgroundColor: darkColors.bgSoft,
  },
  heroWideBackdropBack: {
    position: "absolute",
    left: spacing.md,
  },
  heroWideBackdropBody: {
    paddingHorizontal: detailHeroOverlayInset,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  cover: {
    width: "100%",
    backgroundColor: darkColors.bgSoft,
  },
  fallbackBg: { backgroundColor: darkColors.bgSoft },
  coverBottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  coverBottomGradientPoster: {
    height: "72%",
  },
  coverBottomGradientBackdrop: {
    height: "92%",
  },
  coverOverlay: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: detailHeroOverlayInset,
    paddingBottom: spacing.lg,
  },
  coverOverlayImageOnly: {
    paddingBottom: 0,
  },
  coverSpacer: { flex: 1 },
  coverContent: { gap: spacing.sm },
  belowCover: {
    paddingHorizontal: detailHeroOverlayInset,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: "rgba(8,12,17,0.58)",
    borderWidth: 1,
    borderColor: darkColors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    color: darkColors.text,
    fontSize: typography.fontSize.hero,
    fontWeight: typography.fontWeight.heavy,
  },
  eyebrow: {
    color: darkColors.accent,
    fontWeight: typography.fontWeight.heavy,
    fontSize: typography.fontSize.body,
  },
  eyebrowRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", columnGap: spacing.xs },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  genre: {
    color: darkColors.text,
    borderWidth: 1,
    borderColor: heroChipBorder,
    backgroundColor: heroChipBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    fontSize: typography.fontSize.meta,
    fontWeight: typography.fontWeight.bold,
    overflow: "hidden",
  },
  overview: {
    color: darkColors.textSoft,
    lineHeight: typography.lineHeight.normal,
    fontSize: typography.fontSize.body,
  },
  actions: {
    alignSelf: "stretch",
    marginTop: spacing.xs,
  },
  below: {
    alignSelf: "stretch",
    marginTop: spacing.xs,
  },
});
