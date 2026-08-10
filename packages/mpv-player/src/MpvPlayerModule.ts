import { NativeModule, requireNativeModule } from "expo";

declare class MpvPlayerModule extends NativeModule<Record<string, never>> {
  /**
   * Whether this device decodes AV1 without the tvOS `vo_avfoundation` stall.
   *
   * iOS/tvOS: probes VideoToolbox (`VTIsHardwareDecodeSupported`). Without a
   * hardware AV1 decoder (every current Apple TV) mpv falls back to dav1d
   * software decode, whose 10-bit planar output stalls the display path, so
   * unsupported devices should transcode instead of hang.
   *
   * Android: always true. mpv plays AV1 through its own decoder stack with
   * vo=gpu, which handles 10-bit planar output natively with no stall.
   */
  supportsAv1HardwareDecode(): boolean;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MpvPlayerModule>("MpvPlayer");
