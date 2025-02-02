import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

const { width } = Dimensions.get("window");
const itemWidth = (width - 100) / 3;

const HomePage = ({ levels, onSelectLevel, unlockedLevels }) => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    FunGames: require("./assets/fonts/FunGames.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        // Pre-load fonts, make any API calls you need to do here
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  useEffect(() => {
    console.log("Fonts loaded:", fontsLoaded);
  }, [fontsLoaded]);

  if (!fontsLoaded || !appIsReady) {
    return <Text>.....</Text>;
  } else {
    return (
      <ScrollView style={styles.container} onLayout={onLayoutRootView}>
        <Text style={[styles.title, styles.funGamesText]}>Mizo Crossword</Text>

        <View style={styles.levelsContainer}>
          {levels.map((level, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.levelButton,
                { opacity: unlockedLevels > index ? 1 : 0.5 },
              ]}
              onPress={() => unlockedLevels > index && onSelectLevel(index)}
              disabled={unlockedLevels <= index}
            >
              <View style={styles.levelContent}>
                <Text style={styles.levelNumber}>Level {index + 1}</Text>
                {unlockedLevels <= index ? (
                  <Ionicons name="lock-closed" size={24} color="#fff" />
                ) : (
                  <Ionicons name="game-controller" size={24} color="#fff" />
                )}
              </View>
              <Text style={styles.levelStatus}>
                {unlockedLevels > index ? "Play" : "Locked"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontFamily: "FunGames",
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  funGamesText: {
    fontFamily: "FunGames",
  },
  levelsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    height: itemWidth * 5,
    padding: 20,
    borderRadius: 15,
  },
  levelButton: {
    backgroundColor: "#3498db",
    borderRadius: 15,
    width: itemWidth,
    height: itemWidth,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  levelContent: {
    alignItems: "center",
  },
  levelNumber: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  levelStatus: {
    color: "#fff",
    fontSize: 14,
    marginTop: 5,
  },
});

export default HomePage;
