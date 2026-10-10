const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const androidDir = 'C:\\Users\\Lochana\\Desktop\\Transit-plus-mobile-app-member-2\\mobile\\android';
const logPath = path.join(androidDir, 'gradle-build-diagnostic.log');
const wrapper = path.join(androidDir, 'gradlew.bat');
const env = {
  ...process.env,
  JAVA_HOME: 'C:\\Program Files\\Java\\jdk-17',
  ANDROID_HOME: 'C:\\Users\\Lochana\\AppData\\Local\\Android\\Sdk',
  ANDROID_SDK_ROOT: 'C:\\Users\\Lochana\\AppData\\Local\\Android\\Sdk'
};

const append = (text) => {
  fs.appendFileSync(logPath, text);
  process.stdout.write(text);
};

const run = (command, args) => spawnSync(command, args, { cwd: androidDir, env, encoding: 'utf8', maxBuffer: 20000000 });

fs.writeFileSync(logPath, '');
append(`JAVA_HOME=${env.JAVA_HOME}\n`);
append(`JAVA_EXE=${env.JAVA_HOME}\\bin\\java.exe\n`);
const javaVersion = run(env.JAVA_HOME + '\\bin\\java.exe', ['-version']);
append(`JAVA_VERSION_EXIT=${javaVersion.status}\n`);
append(javaVersion.stdout || '');
append(javaVersion.stderr || '');

const javaPath = run('cmd.exe', ['/d', '/s', '/c', 'where java'], { cwd: androidDir, env, encoding: 'utf8' });
append(`WHERE_JAVA_EXIT=${javaPath.status}\n`);
append(javaPath.stdout || '');
append(javaPath.stderr || '');

const gradle = run('cmd.exe', ['/d', '/s', '/c', `"${wrapper}" --no-daemon assembleDebug --stacktrace`], { cwd: androidDir, env, encoding: 'utf8', maxBuffer: 20000000 });
append(`GRADLE_EXIT_CODE=${gradle.status === null ? 'SIGNAL_OR_ERROR' : gradle.status}\n`);
append(gradle.stdout || '');
append(gradle.stderr || '');

process.exit(gradle.status === null ? 1 : gradle.status);
