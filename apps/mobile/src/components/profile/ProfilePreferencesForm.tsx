import { InfoText } from "@/src/components/layout/InfoText";
import { SettingsSection } from "@/src/components/settings/SettingsSection";
import { PreferenceSectionFeedback, PreferenceSectionSaveButton } from "@/src/components/profile/PreferenceSectionUi";
import { PresetChipRow } from "@/src/components/ui/PresetChipRow";
import { TextField } from "@/src/components/ui/TextField";
import { useUpdateProfilePreferences } from "@/src/hooks/queries";
import { useTimedSectionMessages } from "@/src/hooks/useTimedSectionMessages";
import { type ProfilePreferencesRequest } from "@lunarr/api";
import { readApiError } from "@lunarr/api";
import {
  DEFAULT_SEGMENT_SKIP_PREFERENCES,
  readPlaybackPreference,
  type PlaybackPreference,
} from "@/src/lib/playback/service";
import {
  CONTINUE_AGE_OPTIONS,
  continueAgePresetFromDays,
  parseCustomContinueMaxAgeDays,
  type ContinueAgePreset,
} from "@/src/lib/profile/continue-max-age";
import { readPolicyString } from "@/src/lib/profile/policy";
import { PREFERENCE_SAVED_MESSAGE, type PreferenceSection } from "@/src/lib/profile/preferences";
import { useAuth } from "@/src/store/auth";
import { darkColors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { Fragment, useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

const PLAYBACK_OPTIONS: { value: PlaybackPreference; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "prefer_direct", label: "Prefer direct" },
  { value: "prefer_transcode", label: "Prefer transcode" },
];

const SEGMENT_SKIP_MODE_OPTIONS: { value: "manual" | "automatic"; label: string }[] = [
  { value: "manual", label: "Show skip button" },
  { value: "automatic", label: "Skip automatically" },
];

export function ProfilePreferencesForm() {
  const { user, refreshUser } = useAuth();
  const updatePreferences = useUpdateProfilePreferences();
  const policy = user?.transcodePolicy;
  const transcodingEnabled = policy?.transcodingEnabled === true;
  const [playbackPreference, setPlaybackPreference] = useState<PlaybackPreference>("auto");
  const [preferredAudioLanguage, setPreferredAudioLanguage] = useState("");
  const [preferredSubtitleLanguage, setPreferredSubtitleLanguage] = useState("");
  const [continueAgePreset, setContinueAgePreset] = useState<ContinueAgePreset>(0);
  const [continueMaxAgeDays, setContinueMaxAgeDays] = useState("0");
  const [segmentSkipEnabled, setSegmentSkipEnabled] = useState(true);
  const [segmentSkipAutomatic, setSegmentSkipAutomatic] = useState(false);
  const [sectionErrors, setSectionErrors] = useState<Partial<Record<PreferenceSection, string>>>({});
  const { messages: sectionMessages, clearMessage, showMessage } = useTimedSectionMessages<PreferenceSection>();
  const savingSection = updatePreferences.isPending ? (updatePreferences.variables?.section ?? null) : null;

  const currentPlaybackPreference = readPlaybackPreference(policy) ?? "auto";
  const currentAudioLanguage = readPolicyString(policy, "preferredAudioLanguage");
  const currentSubtitleLanguage = readPolicyString(policy, "preferredSubtitleLanguage");
  const currentContinueMaxAgeDays = user?.continueMaxAgeDays ?? 0;
  const currentSegmentSkip = user?.segmentSkip ?? DEFAULT_SEGMENT_SKIP_PREFERENCES;

  useEffect(() => {
    setPlaybackPreference(currentPlaybackPreference);
  }, [currentPlaybackPreference]);

  useEffect(() => {
    setPreferredAudioLanguage(currentAudioLanguage);
    setPreferredSubtitleLanguage(currentSubtitleLanguage);
  }, [currentAudioLanguage, currentSubtitleLanguage]);

  useEffect(() => {
    setContinueAgePreset(continueAgePresetFromDays(currentContinueMaxAgeDays));
    setContinueMaxAgeDays(String(currentContinueMaxAgeDays));
  }, [currentContinueMaxAgeDays]);

  useEffect(() => {
    setSegmentSkipEnabled(currentSegmentSkip.enabled);
    setSegmentSkipAutomatic(currentSegmentSkip.automatic);
  }, [currentSegmentSkip.automatic, currentSegmentSkip.enabled]);

  const parsedContinueMaxAgeDays =
    continueAgePreset !== "custom" ? continueAgePreset : parseCustomContinueMaxAgeDays(continueMaxAgeDays);

  const languagesDirty =
    preferredAudioLanguage.trim() !== currentAudioLanguage ||
    preferredSubtitleLanguage.trim() !== currentSubtitleLanguage;
  const customContinueDirty =
    continueAgePreset === "custom" &&
    parsedContinueMaxAgeDays !== null &&
    parsedContinueMaxAgeDays !== currentContinueMaxAgeDays;

  const saveSection = async (section: PreferenceSection, body: ProfilePreferencesRequest) => {
    setSectionErrors((current) => ({ ...current, [section]: undefined }));
    clearMessage(section);

    try {
      await updatePreferences.mutateAsync({ section, body });
    } catch (apiError) {
      const message = readApiError(apiError, "Failed to save preferences");
      setSectionErrors((current) => ({
        ...current,
        [section]: message,
      }));
      return false;
    }

    try {
      await refreshUser();
    } catch {
      setSectionErrors((current) => ({
        ...current,
        [section]: "Saved, but could not refresh profile.",
      }));
      return false;
    }

    showMessage(section, PREFERENCE_SAVED_MESSAGE);
    return true;
  };

  const selectPlaybackPreference = (next: PlaybackPreference) => {
    clearMessage("playback");
    setPlaybackPreference(next);
    if (next === currentPlaybackPreference) return;
    void saveSection("playback", { playbackPreference: next }).then((saved) => {
      if (saved) return;
      setPlaybackPreference(currentPlaybackPreference);
    });
  };

  const saveLanguages = () => {
    void saveSection("languages", {
      preferredAudioLanguage: preferredAudioLanguage.trim() || null,
      preferredSubtitleLanguage: preferredSubtitleLanguage.trim() || null,
    });
  };

  const selectContinueAgePreset = (preset: ContinueAgePreset) => {
    clearMessage("continue");
    setContinueAgePreset(preset);
    if (preset === "custom") return;

    setContinueMaxAgeDays(String(preset));
    if (preset === currentContinueMaxAgeDays) return;
    void saveSection("continue", { continueMaxAgeDays: preset }).then((saved) => {
      if (saved) return;
      const currentPreset = continueAgePresetFromDays(currentContinueMaxAgeDays);
      setContinueAgePreset(currentPreset);
      setContinueMaxAgeDays(String(currentContinueMaxAgeDays));
    });
  };

  const saveCustomContinue = () => {
    if (parsedContinueMaxAgeDays === null) {
      setSectionErrors((current) => ({
        ...current,
        continue: "Continue max age must be a number from 0 to 3650 days.",
      }));
      return;
    }
    void saveSection("continue", { continueMaxAgeDays: parsedContinueMaxAgeDays });
  };

  const saveSegmentSkip = (next: { enabled: boolean; automatic: boolean }) => {
    void saveSection("segmentSkip", {
      segmentSkipEnabled: next.enabled,
      segmentSkipAutomatic: next.automatic,
    }).then((saved) => {
      if (saved) return;
      setSegmentSkipEnabled(currentSegmentSkip.enabled);
      setSegmentSkipAutomatic(currentSegmentSkip.automatic);
    });
  };

  const toggleSegmentSkipEnabled = (enabled: boolean) => {
    clearMessage("segmentSkip");
    setSegmentSkipEnabled(enabled);
    if (enabled === currentSegmentSkip.enabled) return;
    saveSegmentSkip({ enabled, automatic: segmentSkipAutomatic });
  };

  const selectSegmentSkipMode = (automatic: boolean) => {
    clearMessage("segmentSkip");
    setSegmentSkipAutomatic(automatic);
    if (automatic === currentSegmentSkip.automatic) return;
    saveSegmentSkip({ enabled: segmentSkipEnabled, automatic });
  };

  return (
    <Fragment>
      <SettingsSection title="Playback">
        <View style={styles.sectionBody}>
          <InfoText variant="muted">
            Auto and prefer direct use signed native file streams in the mobile app. Prefer transcode requests temporary
            HLS instead.
          </InfoText>

          {!transcodingEnabled ? (
            <Text style={styles.notice}>
              Temporary HLS playback is currently disabled by an admin. Compatible files still use direct play.
            </Text>
          ) : null}

          <PresetChipRow
            value={playbackPreference}
            options={PLAYBACK_OPTIONS}
            onValueChange={selectPlaybackPreference}
            disabled={savingSection === "playback"}
          />

          <PreferenceSectionFeedback error={sectionErrors.playback} message={sectionMessages.playback} />
        </View>
      </SettingsSection>

      <SettingsSection title="Preferred languages">
        <View style={styles.sectionBody}>
          <InfoText variant="muted">
            Applied when the server can match audio and subtitle tracks during playback.
          </InfoText>

          <TextField
            label="Preferred audio language"
            value={preferredAudioLanguage}
            onChangeText={(value) => {
              clearMessage("languages");
              setPreferredAudioLanguage(value);
            }}
            placeholder="eng"
            autoCapitalize="none"
            editable={savingSection !== "languages"}
          />
          <TextField
            label="Preferred subtitle language"
            value={preferredSubtitleLanguage}
            onChangeText={(value) => {
              clearMessage("languages");
              setPreferredSubtitleLanguage(value);
            }}
            placeholder="eng"
            autoCapitalize="none"
            editable={savingSection !== "languages"}
          />

          <PreferenceSectionFeedback error={sectionErrors.languages} message={sectionMessages.languages} />

          <PreferenceSectionSaveButton
            visible={languagesDirty}
            saving={savingSection === "languages"}
            onPress={saveLanguages}
          />
        </View>
      </SettingsSection>

      <SettingsSection title="Continue watching">
        <View style={styles.sectionBody}>
          <InfoText variant="muted">
            Hide idle in-progress items from Continue rails after this many days. Set to 0 to show all in-progress
            items.
          </InfoText>

          <PresetChipRow
            value={continueAgePreset}
            options={CONTINUE_AGE_OPTIONS}
            onValueChange={selectContinueAgePreset}
            disabled={savingSection === "continue"}
          />
          {continueAgePreset === "custom" ? (
            <TextField
              label="Continue max age (days)"
              value={continueMaxAgeDays}
              onChangeText={(value) => {
                clearMessage("continue");
                setContinueMaxAgeDays(value);
              }}
              placeholder="14"
              keyboardType="number-pad"
              editable={savingSection !== "continue"}
            />
          ) : null}

          <PreferenceSectionFeedback error={sectionErrors.continue} message={sectionMessages.continue} />

          <PreferenceSectionSaveButton
            visible={customContinueDirty}
            saving={savingSection === "continue"}
            onPress={saveCustomContinue}
          />
        </View>
      </SettingsSection>

      <SettingsSection title="Skip intro & credits">
        <View style={styles.sectionBody}>
          <InfoText variant="muted">Intro, recap, and credits markers from IntroDB during playback.</InfoText>

          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.switchTitle}>Skip intro, recap, and credits</Text>
              <Text style={styles.switchDescription}>
                {segmentSkipEnabled
                  ? "Lunarr looks up segment timestamps when playback starts"
                  : "Segment skip is turned off"}
              </Text>
            </View>
            <Switch
              value={segmentSkipEnabled}
              onValueChange={toggleSegmentSkipEnabled}
              disabled={savingSection === "segmentSkip"}
              trackColor={{ false: darkColors.border, true: darkColors.success }}
              thumbColor={darkColors.text}
            />
          </View>

          <InfoText variant="label">Skip behavior</InfoText>
          <PresetChipRow
            value={segmentSkipAutomatic ? "automatic" : "manual"}
            options={SEGMENT_SKIP_MODE_OPTIONS}
            onValueChange={(mode) => selectSegmentSkipMode(mode === "automatic")}
            disabled={!segmentSkipEnabled || savingSection === "segmentSkip"}
          />

          <InfoText variant="muted">
            Timestamps come from TheIntroDB when available. Automatic skip seeks past each segment once per title.
            Rewinding into a segment does not auto-skip again.
          </InfoText>

          <PreferenceSectionFeedback error={sectionErrors.segmentSkip} message={sectionMessages.segmentSkip} />
        </View>
      </SettingsSection>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  sectionBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  notice: {
    color: darkColors.muted,
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.normal,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  switchCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  switchTitle: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.title,
  },
  switchDescription: {
    color: darkColors.muted,
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.normal,
  },
});
