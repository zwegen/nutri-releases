#!/usr/bin/env sh
DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
GRADLE_VERSION=8.4
WRAPPER_JAR="$DIR/gradle/wrapper/gradle-wrapper.jar"
if [ ! -f "$WRAPPER_JAR" ]; then
  mkdir -p "$DIR/gradle/wrapper"
  if [ ! -f "$DIR/gradle-${GRADLE_VERSION}-bin.zip" ]; then
    wget -q -O "$DIR/gradle-${GRADLE_VERSION}-bin.zip" "https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip"
  fi
  unzip -p "$DIR/gradle-${GRADLE_VERSION}-bin.zip" "gradle-${GRADLE_VERSION}/lib/plugins/gradle-wrapper-${GRADLE_VERSION}.jar" > "$WRAPPER_JAR"
fi
exec java -classpath "$WRAPPER_JAR" org.gradle.wrapper.GradleWrapperMain "$@"
