// Hermes in React Native < 0.75 has no global TextEncoder, but the `qrcode`
// library used by react-native-qrcode-svg calls `new TextEncoder().encode()`
// for every QR value. Without this, drawing a QR code throws
// "ReferenceError: Property 'TextEncoder' doesn't exist".
// Must be imported before any screen (first import in App.js).

if (typeof global.TextEncoder === 'undefined') {
  class TextEncoderPolyfill {
    get encoding() {
      return 'utf-8';
    }

    // Converts a JS string to UTF-8 bytes
    encode(input = '') {
      const str = String(input);
      const bytes = [];
      for (let i = 0; i < str.length; i += 1) {
        let code = str.charCodeAt(i);
        // Combine surrogate pairs (emoji etc.) into one code point
        if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
          const next = str.charCodeAt(i + 1);
          if (next >= 0xdc00 && next <= 0xdfff) {
            code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
            i += 1;
          }
        }
        if (code < 0x80) {
          bytes.push(code);
        } else if (code < 0x800) {
          bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
        } else if (code < 0x10000) {
          bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
        } else {
          bytes.push(
            0xf0 | (code >> 18),
            0x80 | ((code >> 12) & 0x3f),
            0x80 | ((code >> 6) & 0x3f),
            0x80 | (code & 0x3f)
          );
        }
      }
      return new Uint8Array(bytes);
    }
  }

  global.TextEncoder = TextEncoderPolyfill;
}
