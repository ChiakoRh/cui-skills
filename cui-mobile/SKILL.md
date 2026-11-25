---
name: cui-mobile
description: >
  Build Android and iOS apps with CUI (yappologistic's C99 immediate-mode UI
  library): the experimental mobile backends, touch input API, the Gradle
  shell and sideload script for Android, and the iOS/macOS build path. Use
  when the user wants to build or run a CUI app on a phone (APK, Android
  device/emulator, iPhone), mentions mobile/touch targets, or asks about
  CUI's Android/iOS support. For desktop CUI apps use cui-app; for the
  browser/WASM build use cui-web.
---
# cui-mobile

CUI v1.5 added **experimental Android and iOS platform backends**: the same
C99 code and components as desktop, fed by touch instead of mouse. They need
a device or emulator to test and have had less mileage than the desktop
backends — treat bugs as expected and prefer the desktop build while
iterating.

Source of truth: the local clone's `docs/getting-started.md` (the Android/iOS
paragraph), `docs/integration.md` (touch input), `platform/android/` and
`platform/ios/README.md`. The clone's path lives in `paths.json` at the root
of this skill suite; if missing, ask the user where their CUI clone is.

## Touch input (both platforms)

Touch feeds the existing mouse API (first finger = mouse) **and** a raw
multi-touch API (v1.5+):

- Inject/back-end side: `cui_input_touch(ui, finger, down, x, y)`,
  `cui_input_touch_move(ui, finger, x, y)`, `cui_input_touch_cancel(ui,
  finger)` (a system gesture stole the finger).
- Queries: `cui_touch_count`, `cui_touch_down`, `cui_touch_pressed`,
  `cui_touch_released`, `cui_touch_pos(ui, finger)` → `cui_vec2`.
- Fingers are slots `0 .. CUI_TOUCH_MAX - 1`; the platform backend keeps a
  slot for the life of the touch and reports moves/lifts through it.
- Touch reaches the input hook too (no touch-down required for hook
  delivery). A lifted finger stays readable for the frame it lifts.

Widgets behave unchanged — buttons, scrolls, drags all work through the
mouse mapping. No widget takes a finger argument.

## Android (the practical path on Windows/Linux)

Toolchain: Android SDK + NDK + Gradle + `adb`, a connected device or
emulator. The Gradle shell is `platform/android/` in the CUI clone:

```sh
cd <cui-clone>/platform/android
./sideload-apk.sh        # gradle :app:assembleDebug + adb install + launch
```

`sideload-apk.sh` needs `adb` in PATH and one attached device; it builds the
hello APK (`app/build/outputs/apk/debug/app-debug.apk`) and opens
`org.cui.hello/android.app.NativeActivity`.

Shell facts (from `app/build.gradle`): `compileSdk 35`, `minSdk 24`,
`ndkVersion 26.3.11579264`, ABIs `arm64-v8a`, `armeabi-v7a`, `x86_64`.

**Shipping your own app instead of hello:** the Gradle CMake passes
`-DCUI_ANDROID_APP=<name>`, which compiles
`examples/<name>.c` as the shared library the NativeActivity loads
(`android.app.lib_name` in `AndroidManifest.xml`). So either add your app
under `examples/` in the clone, or copy the `platform/android/` shell and
point `CUI_ANDROID_APP` / the manifest at your sources. The app label and
launcher name live in `AndroidManifest.xml`.

Hand-build without Gradle (any host with the NDK):

```sh
cmake -S platform/android -B build-android \
    -DCMAKE_TOOLCHAIN_FILE=$NDK/build/cmake/android.toolchain.cmake \
    -DANDROID_ABI=arm64-v8a -DANDROID_PLATFORM=android-24
cmake --build build-android
```

Rotation: the manifest's `configChanges` handles orientation; the backend
posts a relayout and the next frame picks up the new size.

## iOS (docs-only from Windows)

Everything needs a Mac with Xcode (`platform/ios/README.md`):

- Apps include `cui/cui_ios_main.h`, which renames `main` to
  `cui_ios_user_main`; the UIKit delegate builds the window/EAGL view and
  starts that main on a second thread.
- Renderer: GLES 3 via EAGLContext, or the software renderer.
- Soft-keyboard text and touches queue on the main thread and drain in
  `cui__plat_wait`.
- Build: `cmake -S <clone> -B build-ios -DCUI_PLATFORM=ios ...` with the iOS
  SDK (exact flags in `platform/ios/README.md`).

Do not promise iOS testing from this machine — cross-building needs the iOS
SDK; hand it to the user as "build and run on your Mac".

## Status / build log

- Experimental since v1.5.0 (Nov 2026); less mileage than desktop.
- **Build log: empty.** No APK has been built from this skill yet — after
  the first `sideload-apk.sh` run, record real gotchas here (NDK versions,
  gradle failures, device quirks).
