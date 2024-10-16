import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const itemWidth = (width - 60) / 3;

const HomePage = ({ levels, onSelectLevel, unlockedLevels }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mizo Crossword</Text>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
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
