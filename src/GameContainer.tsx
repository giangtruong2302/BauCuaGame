import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@radix-ui/themes";

interface BetItem {
  id: number;
  name: string;
  image: string;
  bet: number;
}

const ITEMS: BetItem[] = [
  { id: 1, name: "Nai", image: "🦌", bet: 0 },
  { id: 2, name: "Bầu", image: "🎃", bet: 0 },
  { id: 3, name: "Gà", image: "🐓", bet: 0 },
  { id: 4, name: "Cá", image: "🐟", bet: 0 },
  { id: 5, name: "Cua", image: "🦀", bet: 0 },
  { id: 6, name: "Tôm", image: "🦐", bet: 0 },
];

const CHIPS = [1000, 5000, 10000, 50000, 100000];

// Animation variants for dice
const diceVariants = {
  initial: {
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
  },
  rolling: {
    rotateX: [0, 360, 720, 1080],
    rotateY: [0, -360, -720, -1080],
    rotateZ: [0, 180, 360, 720],
    transition: {
      duration: 2,
      ease: "easeInOut",
      times: [0, 0.2, 0.5, 1],
    },
  },
  stopped: {
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Dice Component
const Dice = ({
  result,
  isRolling,
  index,
}: {
  result: number;
  isRolling: boolean;
  index: number;
}) => {
  return (
    <motion.div
      className="dice-container w-32 h-32 relative perspective-1000"
      initial="initial"
      animate={isRolling ? "rolling" : "stopped"}
      variants={diceVariants}
      custom={index}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-6xl">
          {ITEMS[result - 1]?.image || "?"}
        </div>

        <motion.div
          className="absolute inset-0"
          animate={
            isRolling
              ? {
                  x: [0, -10, 10, -10, 10, 0],
                  y: [0, -10, 10, -10, 10, 0],
                }
              : {}
          }
          transition={{
            duration: 0.5,
            repeat: isRolling ? Infinity : 0,
          }}
        />
      </motion.div>
    </motion.div>
  );
};

// Results Component
const Results = ({
  results,
  rolling,
}: {
  results: number[];
  rolling: boolean;
}) => {
  return (
    <div className="bg-red-800 p-6 rounded-lg mb-8 relative overflow-hidden">
      <div className="flex justify-center gap-8">
        {results.map((result, index) => (
          <Dice key={index} result={result} isRolling={rolling} index={index} />
        ))}
      </div>

      <AnimatePresence>
        {rolling && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-200 rounded-full"
                initial={{
                  x: "50%",
                  y: "50%",
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: ["50%", `${Math.random() * 100}%`],
                  y: ["50%", `${Math.random() * 100}%`],
                  scale: [0, 1, 0],
                  opacity: [1, 0.5, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function BauCuaGame() {
  const [balance, setBalance] = useState(500000);
  const [selectedChip, setSelectedChip] = useState(1000);
  const [items, setItems] = useState<BetItem[]>(ITEMS);
  const [rolling, setRolling] = useState(false);
  const [results, setResults] = useState<number[]>([1, 1, 1]);
  const [history, setHistory] = useState<string[]>([]);

  const placeBet = (id: number) => {
    if (rolling) return;
    if (balance < selectedChip) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, bet: item.bet + selectedChip } : item
      )
    );
    setBalance((prev) => prev - selectedChip);
  };

  const resetBets = () => {
    if (rolling) return;
    setItems(ITEMS);
    setBalance((prev) => prev + items.reduce((acc, item) => acc + item.bet, 0));
  };

  const roll = async () => {
    if (rolling) return;
    if (items.every((item) => item.bet === 0)) return;

    setRolling(true);

    // Extended rolling animation
    const rollDuration = 2000;
    const intervalTime = 100;
    const steps = rollDuration / intervalTime;

    for (let i = 0; i < steps; i++) {
      setResults([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      await new Promise((resolve) => setTimeout(resolve, intervalTime));
    }

    // Final results
    const finalResults = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];
    setResults(finalResults);

    // Calculate winnings
    let winAmount = 0;
    items.forEach((item) => {
      const count = finalResults.filter((r) => r === item.id).length;
      if (count > 0) {
        winAmount += item.bet * count;
      }
    });

    setBalance((prev) => prev + winAmount);
    setHistory((prev) => [
      `${new Date().toLocaleTimeString()}: ${finalResults
        .map((r) => ITEMS[r - 1].image)
        .join(" ")} ${winAmount > 0 ? `+${winAmount}` : ""}`,
      ...prev.slice(0, 9),
    ]);

    // Delay resetting the bets for better UX
    setTimeout(() => {
      setItems(ITEMS);
      setRolling(false);
    }, 500);
  };

  return (
    <div className="min-h-svh bg-gradient-to-b from-red-700 to-red-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-4">
            Bầu Cua Tôm Cá
          </h1>
          <div className="text-2xl font-semibold text-yellow-300">
            Số dư: {balance.toLocaleString()}đ
          </div>
        </div>

        {/* Results */}
        <Results results={results} rolling={rolling} />

        {/* Betting Board */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {items.map((item) => (
            <motion.div
              key={item.id}
              className={`bg-white p-4 rounded-lg text-center cursor-pointer ${
                item.bet > 0 ? "ring-2 ring-yellow-400" : ""
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => placeBet(item.id)}
            >
              <div className="text-4xl mb-2">{item.image}</div>
              <div className="text-xl font-semibold">{item.name}</div>
              {item.bet > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-600 font-semibold mt-2"
                >
                  {item.bet.toLocaleString()}đ
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Chips */}
        <div className="flex justify-center gap-4 mb-8">
          {CHIPS.map((chip) => (
            <motion.button
              key={chip}
              className={`px-4 py-2 rounded-full ${
                selectedChip === chip
                  ? "bg-yellow-400 text-black"
                  : "bg-white text-black"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedChip(chip)}
            >
              {chip.toLocaleString()}đ
            </motion.button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mb-8">
          <Button disabled={rolling} onClick={resetBets}>
            Đặt lại
          </Button>
          <Button
            disabled={rolling || items.every((item) => item.bet === 0)}
            onClick={roll}
            className="bg-yellow-400 hover:bg-yellow-500 text-black"
          >
            {rolling ? "Đang quay..." : "Quay"}
          </Button>
        </div>

        {/* History */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">
            Lịch sử
          </h2>
          <div className="space-y-2">
            {history.map((entry, index) => (
              <div key={index} className="text-white">
                {entry}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
