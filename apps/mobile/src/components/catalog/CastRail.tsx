import { PosterImage } from "@/src/components/catalog/PosterImage";
import { tmdbImageUrl } from "@/src/lib/media/images";
import { darkColors } from "@/src/theme/colors";
import { scaleNum } from "@/src/theme/scale";
import { detailContentInset, radii, spacing } from "@/src/theme/spacing";
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

  if (cast.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={styles.title}>Cast</Text>
        <Text style={styles.subtitle}>Top billed people from TMDb.</Text>
      </View>
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={styles.list}
      >
        {cast.map((person, index) => {
          const profileUrl = tmdbImageUrl(person.profilePath, "w185");
          const canOpenPerson = Boolean(person.provider && person.providerId);

          const content = (
            <>
              <View style={styles.profile}>
                {profileUrl ? <PosterImage uri={profileUrl} /> : <Users color={darkColors.muted} size={scaleNum(22)} />}
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {person.name}
              </Text>
              {person.character ? (
                <Text style={styles.character} numberOfLines={1}>
                  {person.character}
                </Text>
              ) : null}
            </>
          );

          if (!canOpenPerson) {
            return (
              <View key={`${person.name}-${index}`} style={styles.person}>
                {content}
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
              style={styles.person}
              accessibilityRole="button"
              accessibilityLabel={`Open cast member ${person.name}`}
            >
              {content}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: -detailContentInset,
    gap: spacing.md,
  },
  heading: {
    gap: 2,
    paddingHorizontal: detailContentInset,
  },
  title: { color: darkColors.text, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.heading },
  subtitle: { color: darkColors.muted, fontSize: typography.fontSize.body },
  list: { flexDirection: "row", paddingHorizontal: detailContentInset },
  person: {
    width: scaleNum(108),
    gap: spacing.xs,
    marginRight: spacing.md,
  },
  profile: {
    aspectRatio: 2 / 3,
    borderRadius: radii.card,
    overflow: "hidden",
    backgroundColor: darkColors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { color: darkColors.text, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.body },
  character: { color: darkColors.muted, fontSize: typography.fontSize.meta },
});
