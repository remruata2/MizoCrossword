import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import HomePage from "./HomePage";
import CrosswordPuzzle from "./CrosswordPuzzle";
import gameData from "./gameData.json";

export default function App() {
  const [currentLevel, setCurrentLevel] = useState(null);
  const [unlockedLevels, setUnlockedLevels] = useState(1);

  const handleLevelComplete = () => {
    if (currentLevel === unlockedLevels - 1) {
      setUnlockedLevels((prevUnlocked) => prevUnlocked + 1);
    }
    console.log("Level complete!");
    setCurrentLevel(null);
  };
  console.log("Current Level:", currentLevel);

  return (
    <View style={styles.container}>
      {currentLevel === null ? (
        <HomePage
          levels={gameData.levels}
          onSelectLevel={setCurrentLevel}
          unlockedLevels={unlockedLevels}
        />
      ) : (
        <CrosswordPuzzle
          level={gameData.levels[currentLevel]}
          onComplete={handleLevelComplete}
          onBack={() => setCurrentLevel(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
});
