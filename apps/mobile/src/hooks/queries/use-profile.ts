import { useMutation } from "@tanstack/react-query";
import { updateProfilePreferences, type ProfilePreferencesRequest } from "@/src/lib/api/generated";
import { type PreferenceSection } from "@/src/lib/profile/preferences";

export function useUpdateProfilePreferences() {
  return useMutation({
    mutationFn: async ({ body }: { section: PreferenceSection; body: ProfilePreferencesRequest }) => {
      const { error } = await updateProfilePreferences({ body });
      if (error) throw error;
    },
  });
}
