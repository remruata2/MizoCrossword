import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";

const { width } = Dimensions.get("window");
const cellSize = Math.floor(width / 10);

const Cell = ({ value, onChange, isBlocked, onFocus, refProp, cellNumber }) => {
  return (
    <View style={styles.cellContainer}>
      {cellNumber && <Text style={styles.cellNumber}>{cellNumber}</Text>}
      {isBlocked ? (
        <View style={styles.blockedCell} />
      ) : (
        <TextInput
          style={styles.cell}
          value={value}
          onChangeText={onChange}
          maxLength={1}
          onFocus={onFocus}
          ref={refProp}
        />
      )}
    </View>
  );
};

const CrosswordPuzzle = ({ level, onComplete, onBack }) => {
  const [grid, setGrid] = useState([]);
  const cellRefs = useRef([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [overlayOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (level && level.grid) {
      const initialGrid = level.grid.map((row) =>
        row.map((cell) => (cell === "#" ? "#" : ""))
      );
      setGrid(initialGrid);
      cellRefs.current = initialGrid.map((row) =>
        row.map(() => React.createRef())
      );
    }
  }, [level]);

  const updateGrid = (rowIndex, colIndex, value) => {
    if (!level || !level.grid || level.grid[rowIndex][colIndex] === "#") return;
    const newGrid = [...grid];
    newGrid[rowIndex][colIndex] = value.toUpperCase();
    setGrid(newGrid);

    // Focus management
    if (value === "") {
      // Backspace: move to previous cell
      const prevCol = colIndex - 1;
      const prevRow = rowIndex - 1;
      if (prevCol >= 0 && grid[rowIndex][prevCol] !== "#") {
        cellRefs.current[rowIndex][prevCol].current.focus();
      } else if (
        prevRow >= 0 &&
        grid[prevRow][grid[prevRow].length - 1] !== "#"
      ) {
        cellRefs.current[prevRow][grid[prevRow].length - 1].current.focus();
      }
    } else {
      // Move to next cell
      const nextCol = colIndex + 1;
      const nextRow = rowIndex + 1;
      if (nextCol < grid[rowIndex].length && grid[rowIndex][nextCol] !== "#") {
        cellRefs.current[rowIndex][nextCol].current.focus();
      } else if (nextRow < grid.length && grid[nextRow][0] !== "#") {
        cellRefs.current[nextRow][0].current.focus();
      }
    }
  };

  const renderGrid = () => {
    return grid.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map((cell, colIndex) => {
          const cellNumber = level.cellNumbers.find(
            (num) => num.row === rowIndex && num.col === colIndex
          )?.number;

          return (
            <Cell
              key={colIndex}
              value={cell}
              onChange={(text) => updateGrid(rowIndex, colIndex, text)}
              isBlocked={cell === "#"}
              onFocus={() => {}}
              refProp={cellRefs.current[rowIndex][colIndex]}
              cellNumber={cellNumber}
            />
          );
        })}
      </View>
    ));
  };

  const renderClues = (direction) => {
    if (!level || !level.clues) return null;
    return level.clues[direction].map((clue) => (
      <View key={clue.number} style={styles.clueContainer}>
        <Text style={styles.clueNumber}>{clue.number}</Text>
        <Text style={styles.clueText}>{clue.clue}</Text>
      </View>
    ));
  };

  const checkCompletion = () => {
    if (!level || !level.grid) return false;
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (level.grid[i][j] !== "#" && grid[i][j] !== level.grid[i][j]) {
          return false;
        }
      }
    }
    return true;
  };

  const fillGridWithAnswers = () => {
    if (level && level.grid) {
      setGrid([...level.grid]);
    }
  };
  const showCompletionOverlay = () => {
    setShowConfetti(true);
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };
  const handleSubmit = () => {
    if (checkCompletion()) {
      showCompletionOverlay();
    } else {
      // Handle incorrect submission
      console.log("Puzzle not completed yet");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>Level {level.number}</Text>
      <ImageBackground
        source={require("./assets/crossword-background.jpg")}
        style={styles.gridBackground}
        imageStyle={styles.gridBackgroundImage}
      >
        <View style={styles.gridContainer}>{renderGrid()}</View>
      </ImageBackground>
      <View style={styles.cluesContainer}>
        <Text style={styles.clueTitle}>Across</Text>
        {renderClues("across")}
        <Text style={styles.clueTitle}>Down</Text>
        {renderClues("down")}
      </View>
      <TouchableOpacity style={styles.fillButton} onPress={fillGridWithAnswers}>
        <Text style={styles.fillButtonText}>Fill Grid (Test)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Text style={styles.congratsText}>Congratulations!</Text>
        <Text style={styles.completeText}>You've completed the level!</Text>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            Animated.timing(overlayOpacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }).start(onComplete);
          }}
        >
          <Text style={styles.nextButtonText}>Next Level</Text>
        </TouchableOpacity>
      </Animated.View>
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={true}
          fadeOut={true}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1,
    backgroundColor: "#3498db",
    borderRadius: 20,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  gridBackground: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  gridBackgroundImage: {
    opacity: 0.2,
  },
  gridContainer: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
  },
  cellContainer: {
    width: cellSize,
    height: cellSize,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },
  cell: {
    width: "100%",
    height: "100%",
    borderWidth: 1,
    borderColor: "#333",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#fff",
    padding: 0,
    zIndex: 1,
  },
  blockedCell: {
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },
  cellNumber: {
    position: "absolute",
    top: 2,
    left: 2,
    fontSize: 10,
    color: "#666",
    zIndex: 1,
  },
  cluesContainer: {
    alignSelf: "stretch",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  clueTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
    color: "#3498db",
  },
  clueContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  clueNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
    color: "#3498db",
  },
  clueText: {
    fontSize: 16,
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    zIndex: 1,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  //   modalView: {
  //     margin: 20,
  //     backgroundColor: "white",
  //     borderRadius: 20,
  //     padding: 35,
  //     alignItems: "center",
  //     shadowColor: "#000",
  //     shadowOffset: {
  //       width: 0,
  //       height: 2,
  //     },
  //     shadowOpacity: 0.25,
  //     shadowRadius: 4,
  //     elevation: 5,
  //   },
  //   modalSuccess: {
  //     backgroundColor: "yellow",
  //     color: "red",
  //   },
  //   modalFailure: {
  //     backgroundColor: "#EEE",
  //   },
  //   modalText: {
  //     marginBottom: 15,
  //     textAlign: "center",
  //     fontSize: 18,
  //     fontWeight: "bold",
  //   },
  //   modalButton: {
  //     backgroundColor: "#3498db",
  //     borderRadius: 10,
  //     padding: 10,
  //     elevation: 2,
  //   },
  //   modalButtonText: {
  //     color: "white",
  //     fontWeight: "bold",
  //     textAlign: "center",
  //   },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  congratsText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  completeText: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 30,
  },
  nextButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  fillButton: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    zIndex: 1,
  },
  fillButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CrosswordPuzzle;
