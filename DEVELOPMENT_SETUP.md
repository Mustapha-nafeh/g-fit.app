# Development Build Setup Guide

## After EAS Build Completes

1. **Download the .ipa file** from the build link provided by EAS
2. **Install on your iOS device** using one of these methods:
   - TestFlight (recommended)
   - Apple Configurator 2
   - Xcode (Devices and Simulators window)

## Running Your App in Development

Once the development build is installed on your device:

```bash
# Start the development server
expo start --ios

# Or start with specific options
expo start --ios --clear
```

## Alternative: Expo Development Build

If you prefer to use Expo's development client instead of a custom build:

```bash
# Install Expo Development Build from App Store
# Then run:
expo start --dev-client
```

## Troubleshooting

If you encounter issues:

1. **Clear Metro cache**: `expo start --clear`
2. **Clear EAS cache**: `eas build --clear-cache`
3. **Reset Metro**: `npx react-native start --reset-cache`

## Build URLs

Your current build: https://expo.dev/accounts/mostafa-nafeh/projects/GTKF/builds/f4860c88-eea2-426a-a3a3-96e8aba32723

## Fixed Issues

- ✅ Downgraded react-native-iap to avoid NitroModules conflicts
- ✅ Simplified plugin configuration
- ✅ Added cache invalidation for iOS builds
- ✅ Fixed CocoaPods dependency issues
