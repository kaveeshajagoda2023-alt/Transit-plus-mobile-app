export function getRuntimePlatform(): 'ios' | 'android' | 'web' | 'node' {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Platform } = require('react-native');
    if (Platform && Platform.OS) {
      return Platform.OS;
    }
  } catch {
    // In Node or test runner
  }

  if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
    return 'web';
  }

  return 'node';
}

export const isWebOrNode = getRuntimePlatform() === 'web' || getRuntimePlatform() === 'node';
export const isNativePlatform = getRuntimePlatform() === 'ios' || getRuntimePlatform() === 'android';
