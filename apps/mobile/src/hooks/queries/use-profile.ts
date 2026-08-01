import { useMutation } from "@tanstack/react-query";
import { updateProfilePreferences, type ProfilePreferencesRequest } from "@lunarr/api";
import { type PreferenceSection } from "@lunarr/core";

export function useUpdateProfilePreferences() {
  return useMutation({
    mutationFn: async ({ body }: { section: PreferenceSection; body: ProfilePreferencesRequest }) => {
      const { error } = await updateProfilePreferences({ body });
      if (error) throw error;
    },
  });
}
