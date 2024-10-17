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
	Modal,
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

const CustomModal = ({ visible, message, type, onClose }) => (
	<Modal
		animationType="fade"
		transparent={true}
		visible={visible}
		onRequestClose={onClose}
	>
		<View style={styles.centeredView}>
			<View style={[styles.modalView, styles[`modal${type}`]]}>
				<Text style={styles.modalText}>{message}</Text>
				<TouchableOpacity style={styles.modalButton} onPress={onClose}>
					<Text style={styles.modalButtonText}>Close</Text>
				</TouchableOpacity>
			</View>
		</View>
	</Modal>
);

const CrosswordPuzzle = ({ level, onComplete, onBack }) => {
	const [grid, setGrid] = useState([]);
	const cellRefs = useRef([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);
	const [modalMessage, setModalMessage] = useState("");
	const [modalType, setModalType] = useState("");

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

		// Focus next cell
		if (value !== "") {
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
	const handleSubmit = () => {
		if (checkCompletion()) {
			console.log("checkCompletion", checkCompletion());
			setModalMessage("Congratulations! I solve thei ta e!");
			setModalType("Success");
			// setModalVisible(true);
			setShowConfetti(true); // Trigger confetti
		} else {
			setModalMessage("A la diklo, try leh rawh!");
			setModalType("Failure");
			setModalVisible(true);
		}
	};

	const handleModalClose = () => {
		setModalVisible(false);
		if (modalType === "Success") {
			// Call onComplete only after the success modal is closed
			onComplete();
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
			<CustomModal
				visible={modalVisible}
				message={modalMessage}
				type={modalType}
				onClose={handleModalClose}
			/>
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
	modalView: {
		margin: 20,
		backgroundColor: "white",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalSuccess: {
		backgroundColor: "yellow",
		color: "red",
	},
	modalFailure: {
		backgroundColor: "#EEE",
	},
	modalText: {
		marginBottom: 15,
		textAlign: "center",
		fontSize: 18,
		fontWeight: "bold",
	},
	modalButton: {
		backgroundColor: "#3498db",
		borderRadius: 10,
		padding: 10,
		elevation: 2,
	},
	modalButtonText: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
	fillButton: {
		backgroundColor: "#e74c3c",
		padding: 15,
		borderRadius: 10,
		alignItems: "center",
		marginBottom: 10,
	},
	fillButtonText: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
});

export default CrosswordPuzzle;
