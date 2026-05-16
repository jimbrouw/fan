# Mobile App TODO

Things to address when rewriting Kitface as a native iOS / Android app.

---

## Camera

- **Lens selection** — web browsers cannot access individual lenses on iOS. Native gives full `AVCaptureDevice` control (Swift) or `react-native-camera` / `expo-camera`. Add 0.5x ultrawide and 1x main lens buttons; skip 3x telephoto (too tight for full-body shots).
- **Camera framing guide** — draw a native overlay guide (head + shoulders oval) using `AVCaptureVideoPreviewLayer` on iOS or `Camera2` on Android. More reliable than the current CSS overlay.
- **Image orientation** — native EXIF handling is automatic. Remove the web workaround for rotated captures.
- **Camera permissions** — use native permission dialogs with proper usage description strings (`NSCameraUsageDescription` in Info.plist, `CAMERA` in AndroidManifest). Show a settings-redirect screen if denied.
- **Photo library save** — add a "Save to Photos" button using `PHPhotoLibrary` (iOS) or `MediaStore` (Android). Web download prompt is a poor substitute.
- **Flash / torch** — optionally expose a flash toggle via `AVCaptureDevice.torchMode`.

---

## Auth

- **Sign in with Apple** — Apple requires it on iOS if any third-party login is offered. Add alongside Google. Supabase supports Apple OAuth.
- **Google Sign-In SDK** — replace browser-based OAuth redirect with the native Google Sign-In SDK for a smoother one-tap flow. Supabase supports the ID token exchange.
- **Secure token storage** — store Supabase session tokens in iOS Keychain / Android Keystore, not in-memory or local storage.
- **Biometric unlock** — optional: Face ID / Touch ID to re-authenticate returning users without full sign-in.

---

## Notifications

- **Push (iOS)** — register with APNs via `UNUserNotificationCenter`. Send device token to Supabase `user_notification_preferences`. Trigger push from server on generation completion. Requires Apple Developer account and push certificate / key.
- **Push (Android)** — use FCM (Firebase Cloud Messaging). Register token the same way.
- **Local notifications** — fall back to a local notification if the app is backgrounded during generation polling.
- **Notification deep link** — tapping a completion notification should open `/result/[jobId]` directly in-app via deep link / universal link.

---

## Monetization

- **In-app purchases** — Apple requires IAP for digital goods sold on iOS. Cannot use Stripe for in-app credit purchases — must go through StoreKit 2. Android requires Google Play Billing for equivalent purchases.
- **Free tier enforcement** — credit balance check still lives server-side (Supabase), but paywall UI needs native IAP purchase flow, not a web Stripe session.
- **Receipt validation** — validate StoreKit receipts or Google Play purchase tokens server-side before crediting the user's balance.
- **Restore purchases** — implement "Restore purchases" button as required by App Store guidelines.

---

## Sharing

- **Native share sheet** — replace the current WhatsApp link with `UIActivityViewController` (iOS) / `Intent.ACTION_SEND` (Android). Shares the image file directly, not a URL.
- **Watermark compositing** — composite the Kitface watermark onto the image client-side using `CoreGraphics` (iOS) or `Canvas` (Android) before sharing or saving. No server round-trip needed.
- **Copy image** — add "Copy to clipboard" for the poster image using `UIPasteboard` / `ClipboardManager`.

---

## Onboarding

- **App Store screenshots** — design 6.7" and 6.1" screenshot sets showing the capture → generate → result flow.
- **Onboarding screens** — 3-screen native onboarding (capture your face, pick your kit, get your poster) shown on first launch only. Store `hasSeenOnboarding` in UserDefaults / SharedPreferences.
- **Permission pre-prompt** — explain why camera access is needed before triggering the system dialog. Users who deny the system dialog cannot be re-prompted.

---

## Performance

- **Background generation polling** — use `URLSession` background tasks (iOS) or `WorkManager` (Android) to poll job status when app is backgrounded, then fire a local notification on completion.
- **Image caching** — cache generated poster thumbnails locally using `NSCache` or a disk cache (SDWebImage / Kingfisher on iOS, Glide on Android).

---

## Infrastructure

- **Deep links / Universal Links** — configure `apple-app-site-association` on `app.kitface.app` so result URLs open in the app. Equivalent: Android App Links.
- **App Store / Play Store** — Apple Developer Program ($99/yr), Google Play Developer account ($25 one-time). Allow 1-4 weeks for first App Store review.
- **Privacy manifest** — Apple requires a `PrivacyInfo.xcprivacy` file declaring data use (camera, photos, network). Required since iOS 17 / Xcode 15.
- **Minimum OS targets** — recommend iOS 16+ (Camera API improvements, SwiftUI maturity) and Android 10+ (API 29).

---

## Nice to have (native only)

- Haptic feedback on shutter press (`UIImpactFeedbackGenerator`)
- Face detection to auto-frame the oval guide (`Vision` framework)
- Live filter preview on camera (show kit colour tint overlay in real time)
- Widget showing latest generated poster (`WidgetKit`)
