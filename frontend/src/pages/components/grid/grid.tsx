"use client";

import React, { useEffect, useState } from "react";
import { useSocket } from "@/context/socket";
import { useUsers, userType } from "@/context/usersContext";

type GridProps = {
  n: number;
};

const Grid = ({ n }: GridProps) => {
  const { userName, socket, roomId } = useSocket();
  const [gridSize, setGridSize] = useState({ widthCell: 0 });
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [board, setBoard] = useState<string[]>([]);
  const [widthCell, setWidthCell] = useState(0);
  const { users } = useUsers();
  const [symbol, setSymbol] = useState<string>("");
  const [isMove, setIsMove] = useState(false);
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (n) 
    setBoard(Array(n * n).fill(""));
  },[n]);
  
  useEffect(() => {
    users.forEach((element: userType) => {
      if (element.id === userName) {
        setSymbol(element.symbol);
      }
    });
  }, [users, userName]);

  useEffect(() => {
    socket.on("room-map", (boardArray: string[], nextSymbol: string) => {
      setBoard(boardArray);
      users.forEach((element: userType) => {
        if (element.symbol === nextSymbol && element.id === userName) {
          setIsMove(true);
        } else if (element.symbol !== nextSymbol && element.id === userName) {
          setIsMove(false);
        }
      });
    });

    socket.on("invalid-move", (str: string) => {
      alert(str);
    });

    socket.on("game-won", (winner: userType) => {
      alert(`${winner.symbol} wins!`);
      setScores((prevScores) => ({
        ...prevScores,
        [winner.id]: (prevScores[winner.id] || 0) + 10,
      }));
      resetGame();
    });

    return () => {
      socket.off("room-map");
      socket.off("invalid-move");
      socket.off("game-won");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, userName, users]);

  useEffect(() => {
    const updateGridSize = () => {
      const userWidth = window.innerWidth;
      const userHeight = window.innerHeight;
      const maxWidthGrid = userWidth * 0.6; // gives 60 vw
      const maxHeightGrid = userHeight - 600;
      const widthCell = maxWidthGrid / (n + 2);
      setWidthCell(widthCell);
      setGridSize({ widthCell });
    };

    updateGridSize();

    window.addEventListener("resize", updateGridSize);
    return () => window.removeEventListener("resize", updateGridSize);
  }, [n]);

  const checkWinner = (board: string[], n: number, symbol: string) => {
    for (let i = 0; i < n; i++) {
      if (board.slice(i * n, i * n + n).every((cell) => cell === symbol)) {
        return true;
      }
    }

    for (let i = 0; i < n; i++) {
      if (board.filter((_, index) => index % n === i).every((cell) => cell === symbol)) {
        return true;
      }
    }

    if (board.filter((_, index) => index % (n + 1) === 0).every((cell) => cell === symbol)) {
      return true;
    }

    if (board.filter((_, index) => index % (n - 1) === 0 && index !== 0 && index !== n * n - 1).every((cell) => cell === symbol)) {
      return true;
    }

    return false;
  };

  const handleCellClick = (index: number) => {
    if (selectedCells.includes(index) || board[index] !== "") {
      return;
    }
    if (!isMove) {
      alert("Not your turn");
      return;
    }
    socket.emit("make-move", roomId, { index, symbol });
    const newBoard = board.slice();
    newBoard[index] = symbol;
    setBoard(newBoard);
    setSelectedCells([...selectedCells, index]);
    setIsMove(false); 

    if (checkWinner(newBoard, n, symbol)) {
      alert(`${symbol} wins!`);
      resetGame();
    } else if (selectedCells.length + 1 === n * n) {
      alert("It's a draw!");
      resetGame();
    }
  };

  const handleUsePowerUp = (powerUp: string) => {
    if (selectedIndex === null) {
      alert("Please select a cell first.");
      return;
    }
    socket.emit("use-powerup", roomId, powerUp, selectedIndex);
  };

  const resetGame = () => {
    setSelectedCells([]);
    setBoard(Array(n * n).fill(""));
    setIsMove(false);
  };

  if (gridSize.widthCell === 0) {
    return null;
  }

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${n}, 1fr)`,
    gridTemplateRows: `repeat(${n}, 1fr)`,
    gap: "5px",
  };

  const cellStyle: React.CSSProperties = {
    width: `${widthCell}px`,
    height: `${widthCell}px`,
  };

  return (
    <div className="grid-container w-[60vw]">
      <div style={{ ...gridStyle, width: widthCell * n }}>
        {Array.from({ length: n * n }).map((_, index) => (
          <div
            key={index}
            className={`cell ${board[index]} ${selectedIndex === index ? 'selected' : ''}`}
            style={cellStyle}
            onClick={() => {
              handleCellClick(index);
              setSelectedIndex(index);
            }}
          >
            {board[index]}
          </div>
        ))}
      </div>
      <div className="powerups">
        <button onClick={() => handleUsePowerUp("clear-cell")}>
          Clear Cell
        </button>
        {/* Add buttons for other power-ups */}
      </div>
      <div className="scores">
        <h3>Scores:</h3>
        <ul>
          {users.map((user:userType) => (
            <li key={user.id}>
              {user.id}: {scores[user.id] || 0}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Grid;
