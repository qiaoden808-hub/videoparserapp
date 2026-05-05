const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const uid = () => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

const iconPath = path.join(__dirname, '..', 'public', 'icons', 'icon-192.png');
const b64 = fs.readFileSync(iconPath).toString('base64');
const iconLines = b64.match(/.{1,72}/g).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>FullScreen</key>
      <true/>
      <key>Icon</key>
      <data>
${iconLines}
      </data>
      <key>IsRemovable</key>
      <true/>
      <key>Label</key>
      <string>Video Parser</string>
      <key>PayloadDescription</key>
      <string>Video Parser - 多平台视频解析</string>
      <key>PayloadDisplayName</key>
      <string>Video Parser</string>
      <key>PayloadIdentifier</key>
      <string>com.videoparser.app.webclip</string>
      <key>PayloadType</key>
      <string>com.apple.webClip</string>
      <key>PayloadUUID</key>
      <string>${uid()}</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>Precomposed</key>
      <false/>
      <key>URL</key>
      <string>https://video-parser-app.vercel.app</string>
    </dict>
  </array>
  <key>PayloadDescription</key>
  <string>安装 Video Parser 到主屏幕</string>
  <key>PayloadDisplayName</key>
  <string>Video Parser</string>
  <key>PayloadIdentifier</key>
  <string>com.videoparser.app</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>${uid()}</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>`;

const outPath = path.join(__dirname, '..', 'public', 'install.mobileconfig');
fs.writeFileSync(outPath, xml);
console.log('OK - written to', outPath);
