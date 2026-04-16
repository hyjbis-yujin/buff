const fs = require('fs');
const path = require('path');

/**
 * 1. 환경 변수 수동 로드
 */
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf8');
      envFile.split('\n').forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) process.env[match[1].trim()] = match[2].trim();
      });
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * 2. 특정 키 존재 여부 확인
 */
function ensureEnv(key) {
  if (!process.env[key]) {
    console.error(`❌ ERROR: ${key}가 존재하지 않습니다. 스크립트를 중단합니다.`);
    process.exit(1);
  }
  return process.env[key];
}

module.exports = {
  loadEnv,
  ensureEnv
};
