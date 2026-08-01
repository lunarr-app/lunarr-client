import { InfoLabel, InfoMuted } from "@/src/components/layout/InfoText";
import { PresetChipRow } from "@/src/components/ui/PresetChipRow";
import { TextField } from "@/src/components/ui/TextField";
import { PreferenceSectionFeedback, PreferenceSectionSaveButton } from "@/src/components/settings/PreferenceSectionUi";
import { SettingsSection } from "@/src/components/settings/SettingsSection";
import { updateProfilePreferences, type ProfilePreferencesRequest } from "@lunarr/api";
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
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { Fragment, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const PLAYBACK_OPTIONS: { value: PlaybackPreference; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "prefer_direct", label: "Prefer direct" },
  { value: "prefer_transcode", label: "Prefer transcode" },
];

const SEGMENT_SKIP_MODE_OPTIONS: { value: "manual" | "automatic"; label: string }[] = [
  { value: "manual", label: "Show skip button" },
  { value: "automatic", label: "Skip automatically" },
];

function useTimedMessages<T extends string>() {
  const [messages, setMessages] = useState<Partial<Record<T, string>>>({});
  const timers = useRef<Partial<Record<T, ReturnType<typeof setTimeout>>>>({});

  const show = (key: T, message: string) => {
    if (timers.current[key]) clearTimeout(timers.current[key]);
    setMessages((current) => ({ ...current, [key]: message }));
    timers.current[key] = setTimeout(() => {
      setMessages((current) => ({ ...current, [key]: undefined }));
    }, 2500);
  };

  const clear = (key: T) => {
    if (timers.current[key]) clearTimeout(timers.current[key]);
    setMessages((current) => ({ ...current, [key]: undefined }));
  };

  return { messages, show, clear };
}

export function PreferencesForm() {
  const { user, refreshUser } = useAuth();
  const { scale } = useTVScale();
  const policy = user?.transcodePolicy;
  const transcodingEnabled = policy?.transcodingEnabled === true;
  const [playbackPreference, setPlaybackPreference] = useState<PlaybackPreference>("auto");
  const [preferredAudioLanguage, setPreferredAudioLanguage] = useState("");
  const [preferredSubtitleLanguage, setPreferredSubtitleLanguage] = useState("");
  const [continueAgePreset, setContinueAgePreset] = useState<ContinueAgePreset>(0);
  const [continueMaxAgeDays, setContinueMaxAgeDays] = useState("0");
  const [segmentSkipEnabled, setSegmentSkipEnabled] = useState(true);
  const [segmentSkipAutomatic, setSegmentSkipAutomatic] = useState(false);
  const [savingSection, setSavingSection] = useState<PreferenceSection | null>(null);
  const [sectionErrors, setSectionErrors] = useState<Partial<Record<PreferenceSection, string>>>({});
  const { messages: sectionMessages, clear: clearMessage, show: showMessage } = useTimedMessages<PreferenceSection>();

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
    setSavingSection(section);
    setSectionErrors((current) => ({ ...current, [section]: undefined }));
    clearMessage(section);

    try {
      const { error: apiError } = await updateProfilePreferences({ body });
      if (apiError) {
        setSectionErrors((current) => ({
          ...current,
          [section]: readApiError(apiError, "Failed to save preferences"),
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
    } finally {
      setSavingSection(null);
    }
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
      setContinueMaxAgeDays(String(currentPreset));
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

  const sectionBodyStyle = { padding: spacing.lg * scale, gap: spacing.md * scale };
  const noticeStyle = { fontSize: typography.fontSize.body * scale, lineHeight: typography.lineHeight.normal * scale };
  const toggleGroupStyle = { gap: spacing.md * scale };
  const toggleCopyStyle = { gap: Math.max(2, 4 * scale) };
  const toggleTitleStyle = { fontSize: typography.fontSize.title * scale };
  const toggleDescriptionStyle = {
    fontSize: typography.fontSize.body * scale,
    lineHeight: typography.lineHeight.normal * scale,
  };

  return (
    <Fragment>
      <SettingsSection title="Playback">
        <View style={sectionBodyStyle}>
          <InfoMuted>
            Auto and prefer direct use signed native file streams in the mobile app. Prefer transcode requests temporary
            HLS instead.
          </InfoMuted>

          {!transcodingEnabled ? (
            <Text style={[styles.notice, noticeStyle]}>
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
        <View style={sectionBodyStyle}>
          <InfoMuted>Applied when the server can match audio and subtitle tracks during playback.</InfoMuted>

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
            dirty={languagesDirty}
            saving={savingSection === "languages"}
            onPress={saveLanguages}
          />
        </View>
      </SettingsSection>

      <SettingsSection title="Continue watching">
        <View style={sectionBodyStyle}>
          <InfoMuted>
            Hide idle in-progress items from Continue rails after this many days. Set to 0 to show all in-progress
            items.
          </InfoMuted>

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
            dirty={customContinueDirty}
            saving={savingSection === "continue"}
            onPress={saveCustomContinue}
          />
        </View>
      </SettingsSection>

      <SettingsSection title="Skip intro & credits">
        <View style={sectionBodyStyle}>
          <InfoMuted>Intro, recap, and credits markers from IntroDB during playback.</InfoMuted>

          <View style={toggleGroupStyle}>
            <View style={toggleCopyStyle}>
              <Text style={[styles.toggleTitle, toggleTitleStyle]}>Skip intro, recap, and credits</Text>
              <Text style={[styles.toggleDescription, toggleDescriptionStyle]}>
                {segmentSkipEnabled
                  ? "Lunarr looks up segment timestamps when playback starts"
                  : "Segment skip is turned off"}
              </Text>
            </View>
            <PresetChipRow
              value={segmentSkipEnabled ? "on" : "off"}
              options={[
                { value: "on", label: "On" },
                { value: "off", label: "Off" },
              ]}
              onValueChange={(next) => toggleSegmentSkipEnabled(next === "on")}
              disabled={savingSection === "segmentSkip"}
            />
          </View>

          <InfoLabel>Skip behavior</InfoLabel>
          <PresetChipRow
            value={segmentSkipAutomatic ? "automatic" : "manual"}
            options={SEGMENT_SKIP_MODE_OPTIONS}
            onValueChange={(next) => selectSegmentSkipMode(next === "automatic")}
            disabled={!segmentSkipEnabled || savingSection === "segmentSkip"}
          />

          <InfoMuted>
            Timestamps come from TheIntroDB when available. Automatic skip seeks past each segment once per title.
            Rewinding into a segment does not auto-skip again.
          </InfoMuted>

          <PreferenceSectionFeedback error={sectionErrors.segmentSkip} message={sectionMessages.segmentSkip} />
        </View>
      </SettingsSection>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  notice: { color: darkColors.muted },
  toggleTitle: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.medium,
  },
  toggleDescription: {
    color: darkColors.muted,
  },
});
