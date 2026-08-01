import { PosterImage } from "@/src/components/catalog/PosterImage";
import { FocusRing } from "@/src/components/ui/FocusRing";
import { tmdbImageUrl } from "@/src/lib/media/images";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing, tvSafe } from "@/src/theme/spacing";
import { tvSize, useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { useRouter } from "expo-router";
import { Users } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export type CastMember = {
  name: string;
  character?: string | null;
  profilePath?: string | null;
  provider?: string | null;
  providerId?: string | null;
};

type Props = {
  cast: CastMember[];
};

export function CastRail({ cast }: Props) {
  const router = useRouter();
  const { scale } = useTVScale();

  if (cast.length === 0) return null;

  const personWidth = tvSize(160, scale);
  const personGap = spacing.md * scale;

  const sectionStyle = { gap: spacing.md * scale, marginHorizontal: -tvSafe.horizontal * scale };
  const headingStyle = { gap: spacing.xs * scale, paddingHorizontal: tvSafe.horizontal * scale };
  const titleStyle = { fontSize: typography.fontSize.heading * scale };
  const subtitleStyle = { fontSize: typography.fontSize.body * scale };
  const listStyle = { paddingVertical: tvSize(12, scale), paddingLeft: tvSafe.horizontal * scale };
  const personStyle = { width: personWidth, gap: spacing.xs * scale, marginRight: personGap };
  const profileStyle = { borderRadius: radii.card * scale };
  const nameStyle = { fontSize: typography.fontSize.title * scale, marginTop: spacing.xs * scale };
  const characterStyle = { fontSize: typography.fontSize.body * scale };
  const iconSize = Math.round(32 * scale);

  return (
    <View style={[styles.section, sectionStyle]}>
      <View style={[styles.heading, headingStyle]}>
        <Text style={[styles.title, titleStyle]}>Cast</Text>
        <Text style={[styles.subtitle, subtitleStyle]}>Top billed people from TMDb.</Text>
      </View>
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={personWidth + personGap}
        snapToAlignment="start"
        contentContainerStyle={listStyle}
      >
        {cast.map((person, index) => {
          const profileUrl = tmdbImageUrl(person.profilePath, "w185");
          const canOpenPerson = Boolean(person.provider && person.providerId);

          const profile = (
            <View style={[styles.profile, profileStyle]}>
              {profileUrl ? <PosterImage uri={profileUrl} /> : <Users color={darkColors.muted} size={iconSize} />}
            </View>
          );

          const text = (
            <>
              <Text style={[styles.name, nameStyle]} numberOfLines={1}>
                {person.name}
              </Text>
              {person.character ? (
                <Text style={[styles.character, characterStyle]} numberOfLines={1}>
                  {person.character}
                </Text>
              ) : null}
            </>
          );

          if (!canOpenPerson) {
            return (
              <View key={`${person.name}-${index}`} style={personStyle}>
                {profile}
                {text}
              </View>
            );
          }

          return (
            <Pressable
              key={`${person.name}-${index}`}
              onPress={() =>
                router.push({
                  pathname: "/people/[provider]/[id]",
                  params: {
                    provider: person.provider!,
                    id: person.providerId!,
                  },
                })
              }
              style={personStyle}
              focusable
              accessibilityRole="button"
              accessibilityLabel={`Open cast member ${person.name}`}
            >
              {({ focused }) => (
                <>
                  <FocusRing
                    focused={focused}
                    width={Math.max(2, 3 * scale)}
                    color={darkColors.accent}
                    radius={radii.card * scale}
                    style={[styles.profileRing, focused && styles.profileRingFocused]}
                  >
                    {profile}
                  </FocusRing>
                  {text}
                </>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {},
  heading: {},
  title: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  subtitle: {
    color: darkColors.muted,
  },
  list: {
    flexDirection: "row",
  },
  profile: {
    aspectRatio: 2 / 3,
    overflow: "hidden",
    backgroundColor: darkColors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  profileRing: {
    alignSelf: "stretch",
  },
  profileRingFocused: {
    transform: [{ scale: 1.02 }],
  },
  name: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  character: {
    color: darkColors.muted,
  },
});
