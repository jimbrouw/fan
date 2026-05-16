import { FalSeedanceVideoProvider } from "./falVideo";
import { getDefaultMuapiVideoModel, MuapiVideoGenerationProvider } from "./muapiVideo";

export function createVideoProvider(providerId?: string | null) {
  // FAL is intentionally kept wired for a later switch-back:
  // providerId === "fal-seedance-2" returns the existing FAL Seedance provider.
  if (providerId === "fal-seedance-2") {
    return new FalSeedanceVideoProvider();
  }

  if (providerId?.startsWith("muapi:")) {
    return new MuapiVideoGenerationProvider(providerId.replace("muapi:", ""));
  }

  return new MuapiVideoGenerationProvider(getDefaultMuapiVideoModel());
}
