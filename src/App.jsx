import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as htmlToImage from "html-to-image";
import AZTEC from "./assets/AZTEC.svg";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Try to fetch an image (CORS) and convert to data URL — used only for export
async function fetchToDataURL(url) {
  const res = await fetch(url, { mode: "cors", cache: "no-store" });
  if (!res.ok) throw new Error(`avatar fetch ${res.status}`);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = reject;
    fr.onload = () => resolve(fr.result);
    fr.readAsDataURL(blob);
  });
}

// Data-URL SVG with user initials (never taints canvas)
function initialsDataUrl(nameLike) {
  const txt = (nameLike || "Aztec Learner").trim().replace(/^@/, "");
  const parts = txt.split(" ").filter(Boolean);
  const first = parts[0] || "Aztec";
  const second = parts[1] || "IQ";
  const initials = (first[0] || "A") + (second[0] || "Q");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'>
    <rect width='100%' height='100%' rx='16' ry='16' fill='#111827'/>
    <text x='50%' y='56%' text-anchor='middle' font-size='40'
      font-family='Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif'
      fill='#a5b4fc'>${initials.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Build a list of candidate avatar URLs for a handle.
function avatarCandidates(handle) {
  if (!handle) return [];
  const h = encodeURIComponent(handle);
  return [
    `https://unavatar.io/x/${h}`,
    `https://unavatar.io/twitter/${h}`,
    `https://unavatar.io/${h}`,
    `https://unavatar.io/github/ghost`,
  ];
}

// AZTEC BLOGS
const AZTEC_ARTICLES = [
  {
    title: "Aztec Basics",
    url: "https://aztec.network/basics",
    blurb: "Learn the fundamentals of Aztec and its approach to privacy.",
  },
  {
    title: "A New Brand for a New Era of Aztec",
    url: "https://aztec.network/blog/a-new-brand-for-a-new-era-of-aztec",
    blurb: "Exploring Aztec's rebrand and its vision for private, scalable Ethereum.",
  },
  {
    title: "Why Payy Left Halo2 for Noir",
    url: "https://aztec.network/blog/just-write-if-why-payy-left-halo2-for-noir",
    blurb: "Understanding the shift from Halo2 to Noir for better developer experience.",
  },
  {
    title: "Aztec Docs",
    url: "https://docs.aztec.network/",
    blurb: "Technical documentation: architecture, Noir, rollups, developer guides.",
  },
];

// QUESTION BANK (AZTEC)
const QUESTION_BANK = [
  {
    q: "Aztec's core role is best described as:",
    choices: [
      "A privacy-first zkRollup on Ethereum",
      "A Layer 1 blockchain",
      "A centralized exchange",
      "A staking-only protocol",
    ],
    answerIndex: 0,
  },
  {
    q: "What does 'zk' in zkRollup stand for?",
    choices: ["Zero-Knowledge", "Zero-Keeper", "Zebra-Kernel", "Zone-Key"],
    answerIndex: 0,
  },
  {
    q: "What key limitation of Ethereum does Aztec aim to solve?",
    choices: [
      "Lack of privacy",
      "Slow block times",
      "No staking rewards",
      "Centralized sequencers",
    ],
    answerIndex: 0,
  },
  {
    q: "Aztec's Noir is:",
    choices: [
      "A zk programming language for writing private smart contracts",
      "An NFT marketplace",
      "A rollup bridge",
      "A wallet app",
    ],
    answerIndex: 0,
  },
  {
    q: "Why did Aztec move away from Halo2?",
    choices: [
      "It was too slow and hard for developers",
      "It was centralized",
      "It had no cryptographic security",
      "It only worked on Bitcoin",
    ],
    answerIndex: 0,
  },
  {
    q: "What execution model makes Aztec unique?",
    choices: [
      "Hybrid public + private execution",
      "Proof of Work",
      "Layer 3 parallel execution",
      "Optimistic fraud proofs",
    ],
    answerIndex: 0,
  },
  {
    q: "What is the vision behind Aztec's rebrand?",
    choices: [
      "Make privacy the default",
      "Focus only on NFTs",
      "End Ethereum compatibility",
      "Switch to a proof of stake L1",
    ],
    answerIndex: 0,
  },
  {
    q: "Which network is Aztec built on?",
    choices: ["Ethereum", "Cosmos", "Polkadot", "Bitcoin"],
    answerIndex: 0,
  },
  {
    q: "Which cryptography enables Aztec's privacy?",
    choices: [
      "Zero-Knowledge Proofs",
      "SHA256 hashing",
      "Post-quantum encryption",
      "RSA signatures",
    ],
    answerIndex: 0,
  },
  {
    q: "What is Aztec Connect?",
    choices: [
      "The first implementation of Aztec's privacy layer on Ethereum",
      "Aztec's main wallet app",
      "A validator client",
      "A DeFi lending protocol",
    ],
    answerIndex: 0,
  },
  {
    q: "What is the broader goal of Aztec?",
    choices: [
      "Bring privacy and scalability to Ethereum",
      "Replace Bitcoin",
      "Be the fastest centralized exchange",
      "Launch meme coins",
    ],
    answerIndex: 0,
  },
  {
    q: "What does Noir enable developers to do?",
    choices: [
      "Write private applications without deep ZK knowledge",
      "Run GPU miners",
      "Design validator staking pools",
      "Create NFTs only",
    ],
    answerIndex: 0,
  },
  {
    q: "In Aztec's hybrid model, what remains public?",
    choices: [
      "Proofs of correct execution",
      "All contract logic",
      "User wallet addresses",
      "Sequencer logs",
    ],
    answerIndex: 0,
  },
  {
    q: "Which layer is Aztec considered?",
    choices: [
      "Layer 2 zkRollup",
      "Layer 1",
      "Layer 3",
      "Sidechain",
    ],
    answerIndex: 0,
  },
  {
    q: "Aztec emphasizes that privacy should be:",
    choices: ["The default", "Optional", "Paid-only", "For institutions"],
    answerIndex: 0,
  },
  {
    q: "What does Noir get compared to in developer experience?",
    choices: ["Rust and Solidity", "Python and C++", "Go and Java", "Haskell and Lisp"],
    answerIndex: 0,
  },
  {
    q: "Why is privacy important in DeFi according to Aztec?",
    choices: [
      "To enable confidential transactions like lending and trading",
      "To remove staking rewards",
      "To make all data public",
      "To stop validator committees",
    ],
    answerIndex: 0,
  },
  {
    q: "What major limitation of Halo2 was highlighted by Aztec?",
    choices: [
      "Slow proving times and poor developer experience",
      "It had bugs in consensus",
      "It lacked Ethereum compatibility",
      "It only worked for NFTs",
    ],
    answerIndex: 0,
  },
  {
    q: "What best describes Aztec?",
    choices: [
      "A privacy-first zkRollup",
      "A staking platform",
      "A wallet app",
      "A centralized L2",
    ],
    answerIndex: 0,
  },
  {
    q: "Which group does Aztec especially aim to empower?",
    choices: ["DeFi developers", "NFT artists", "Validators only", "Exchanges"],
    answerIndex: 0,
  },
  {
    q: "Which key feature allows public + private function calls in Aztec?",
    choices: [
      "Hybrid execution model",
      "Optimistic proofs",
      "zkSync integration",
      "Parallel state channels",
    ],
    answerIndex: 0,
  },
  {
    q: "What is Noir designed to abstract away?",
    choices: [
      "The complexity of writing ZK circuits",
      "Gas fees",
      "Validator rewards",
      "Wallet UX",
    ],
    answerIndex: 0,
  },
  {
    q: "Which of these is a use case for Aztec?",
    choices: [
      "Confidential DeFi (private lending, trading, DAOs)",
      "Proof of work mining",
      "Running centralized order books",
      "Off-chain databases",
    ],
    answerIndex: 0,
  },
  {
    q: "What is the balance Aztec tries to achieve?",
    choices: [
      "Privacy + public verifiability",
      "Centralization + scalability",
      "Speed + gas fees",
      "Staking + liquidity",
    ],
    answerIndex: 0,
  },
  {
    q: "Which programming model is Noir?",
    choices: [
      "zkDSL (domain-specific language)",
      "General-purpose assembly",
      "EVM bytecode only",
      "Functional Haskell",
    ],
    answerIndex: 0,
  },
  {
    q: "What phrase captures Aztec's vision?",
    choices: [
      "Privacy for everyone",
      "Transparency forever",
      "Gasless consensus",
      "Scalability only",
    ],
    answerIndex: 0,
  },
  {
    q: "Which privacy feature is unique to Aztec compared to most L2s?",
    choices: [
      "Encrypted smart contracts",
      "Optimistic rollups",
      "Fraud proofs",
      "Custodial bridging",
    ],
    answerIndex: 0,
  },
  {
    q: "What is the main importance of Aztec's mission?",
    choices: [
      "To make privacy usable, verifiable, and accessible",
      "To compete with Bitcoin miners",
      "To stop staking",
      "To launch meme tokens",
    ],
    answerIndex: 0,
  },
  {
    q: "Which blog post explains why Aztec shifted from Halo2 to Noir?",
    choices: [
      "Why Payy Left Halo2 for Noir",
      "Aztec Basics",
      "A New Brand for a New Era",
      "Aztec Docs",
    ],
    answerIndex: 0,
  },
  {
    q: "What is Aztec primarily focused on?",
    choices: [
      "Building a decentralized exchange",
      "Privacy-first Ethereum Layer 2 with programmable confidentiality",
      "NFT marketplace for artists",
      "A Bitcoin scaling solution",
    ],
    answerIndex: 1,
  },
  {
    q: "Aztec can be best described as:",
    choices: [
      "A private zkRollup for Ethereum",
      "A public EVM blockchain",
      "A proof-of-stake L1 chain",
      "A data availability layer",
    ],
    answerIndex: 0,
  },
  {
    q: "What type of rollup does Aztec use?",
    choices: ["zkRollup", "Optimistic rollup", "Sidechain", "Validium"],
    answerIndex: 0,
  },
  {
    q: "What is Noir?",
    choices: [
      "Aztec's general-purpose zero-knowledge programming language",
      "A consensus algorithm",
      "A wallet for private payments",
      "A layer-1 blockchain",
    ],
    answerIndex: 0,
  },
  {
    q: "Why did Aztec move from Halo2 to Noir?",
    choices: [
      "To reduce gas fees only",
      "To enable a universal, high-level zk programming framework",
      "To replace zk proofs with multisig",
      "Because Noir is faster than Solidity",
    ],
    answerIndex: 1,
  },
  {
    q: "What cryptographic system underpins Aztec proofs?",
    choices: ["STARKs", "SNARKs", "Bulletproofs", "SHA256 trees"],
    answerIndex: 1,
  },
  {
    q: "What does Aztec's hybrid model combine?",
    choices: [
      "Public Ethereum execution with private state and computation",
      "Bitcoin settlement with Ethereum DA",
      "Proof-of-work and proof-of-stake consensus",
      "Rollups and sidechains",
    ],
    answerIndex: 0,
  },
  {
    q: "What does 'programmable privacy' in Aztec mean?",
    choices: [
      "Users can choose what parts of a transaction are private or public",
      "Every transaction is always 100% private",
      "Transactions are always public with zk audit logs",
      "Only DeFi protocols can use privacy",
    ],
    answerIndex: 0,
  },
  {
    q: "Which base layer does Aztec settle to?",
    choices: ["Ethereum", "Bitcoin", "Cosmos Hub", "Polkadot"],
    answerIndex: 0,
  },
  {
    q: "What role do zk proofs play in Aztec?",
    choices: [
      "They prove transaction validity while preserving privacy",
      "They are only used for block headers",
      "They replace consensus",
      "They are only for smart contracts",
    ],
    answerIndex: 0,
  },
  {
    q: "What is the main limitation of traditional Ethereum that Aztec aims to fix?",
    choices: [
      "Scalability and confidentiality",
      "Consensus speed",
      "Validator set size",
      "Lack of NFTs",
    ],
    answerIndex: 0,
  },
  {
    q: "What programming model does Noir use?",
    choices: ["Circuit-based", "Smart contract only", "State channels", "Rollup proofs"],
    answerIndex: 0,
  },
  {
    q: "Which type of transactions did the original Aztec v1 support?",
    choices: ["Private payments only", "DeFi smart contracts", "NFT minting", "DAOs"],
    answerIndex: 0,
  },
  {
    q: "Aztec Connect (the previous system) allowed:",
    choices: [
      "Private DeFi interactions on Ethereum",
      "Launching a new L1 chain",
      "Creating DAOs",
      "Running optimistic rollups",
    ],
    answerIndex: 0,
  },
  {
    q: "What does the term 'end-to-end privacy' mean in Aztec?",
    choices: [
      "Both user data and execution logic can remain confidential",
      "Only wallet addresses are private",
      "Only balances are hidden",
      "It hides everything forever without proofs",
    ],
    answerIndex: 0,
  },
  {
    q: "Which statement is true about Aztec's hybrid execution?",
    choices: [
      "Public Ethereum state can interact with private Aztec state",
      "Aztec ignores Ethereum entirely",
      "Aztec uses only off-chain proofs",
      "Only private contracts can run",
    ],
    answerIndex: 0,
  },
  {
    q: "What is one major benefit of building with Noir?",
    choices: [
      "Write once, prove anywhere (portable zk circuits)",
      "Cheaper gas for Solidity contracts",
      "No cryptography required for contracts",
      "It replaces the EVM",
    ],
    answerIndex: 0,
  },
  {
    q: "What scalability technique does Aztec rely on?",
    choices: [
      "Batching transactions and proving them with zkRollup",
      "Increasing block size",
      "Proof-of-stake sharding",
      "State channels only",
    ],
    answerIndex: 0,
  },
  {
    q: "How does Aztec preserve privacy while staying verifiable?",
    choices: [
      "Zero-knowledge proofs show validity without revealing private inputs",
      "It hides data in off-chain servers",
      "It encrypts everything permanently",
      "It does not verify transactions",
    ],
    answerIndex: 0,
  },
  {
    q: "What kind of developers is Noir designed for?",
    choices: [
      "Any developer, even without zk expertise",
      "Only cryptographers",
      "Only Ethereum core devs",
      "Only Solidity experts",
    ],
    answerIndex: 0,
  },
  {
    q: "What advantage does Noir bring compared to Halo2?",
    choices: [
      "Simpler, higher-level language for circuits",
      "Faster consensus finality",
      "Lower block propagation latency",
      "Optimistic fraud proofs",
    ],
    answerIndex: 0,
  },
  {
    q: "Which part of a transaction can be private in Aztec?",
    choices: [
      "Amounts, addresses, and logic (depending on configuration)",
      "Only the token type",
      "Only gas fees",
      "Only miner rewards",
    ],
    answerIndex: 0,
  },
  {
    q: "Aztec's long-term vision is:",
    choices: [
      "A fully programmable, privacy-preserving Ethereum Layer 2",
      "Replacing Ethereum as an L1",
      "Becoming a DAO launchpad",
      "Being a wallet provider",
    ],
    answerIndex: 0,
  },
  {
    q: "What does the Noir compiler output?",
    choices: [
      "zk circuits that can be proven and verified",
      "Solidity contracts",
      "WebAssembly only",
      "EVM bytecode directly",
    ],
    answerIndex: 0,
  },
  {
    q: "What makes Aztec unique compared to other zkRollups?",
    choices: [
      "It combines privacy with smart contract programmability",
      "It only scales Ethereum transactions",
      "It focuses only on payments",
      "It avoids zk proofs entirely",
    ],
    answerIndex: 0,
  },
  {
    q: "What is a key user benefit of Aztec?",
    choices: [
      "Control over what stays private or public",
      "Automatic airdrops",
      "Guaranteed staking rewards",
      "Free gas forever",
    ],
    answerIndex: 0,
  },
  {
    q: "In Aztec, confidentiality is:",
    choices: [
      "The default for transactions",
      "Optional only for DAOs",
      "Never possible",
      "Only applied to NFTs",
    ],
    answerIndex: 0,
  },
  {
    q: "Why is privacy important for DeFi apps on Aztec?",
    choices: [
      "Prevents front-running and protects user strategies",
      "Hides chain congestion",
      "Avoids transaction fees",
      "Increases block size",
    ],
    answerIndex: 0,
  },
  {
    q: "What is the relationship between Aztec and Ethereum?",
    choices: [
      "Aztec settles on Ethereum, inheriting its security",
      "Aztec replaces Ethereum entirely",
      "Aztec only works on Bitcoin",
      "Aztec is a separate L1 with no link to Ethereum",
    ],
    answerIndex: 0,
  },
];

// Shuffle Logic
function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getShuffledQuestions() {
  return QUESTION_BANK.map((q) => {
    const choices = [...q.choices];
    const correctAnswer = choices[q.answerIndex];
    const shuffled = shuffleArray(choices);
    const newAnswerIndex = shuffled.indexOf(correctAnswer);

    return {
      q: q.q,
      choices: shuffled,
      answerIndex: newAnswerIndex,
    };
  });
}

function sampleQuestions(arr, n) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

export default function AztecIQApp() {
  const [step, setStep] = useState(0);
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");

  const candidates = useMemo(
    () => (handle ? avatarCandidates(handle) : []),
    [handle]
  );
  const [avatarIdx, setAvatarIdx] = useState(0);
  useEffect(() => {
    setAvatarIdx(0);
  }, [handle]);

  const displayAvatarSrc =
    candidates[avatarIdx] || "https://unavatar.io/github/ghost";

  const [avatarOverride, setAvatarOverride] = useState(null);
  const exportAvatarSrc = avatarOverride || displayAvatarSrc;

  const [quiz, setQuiz] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selections, setSelections] = useState([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [started, setStarted] = useState(false);

  const BASE_POINTS = 10;
  const TIME_BONUS_MAX = 20;
  const PER_Q_MAX = BASE_POINTS + TIME_BONUS_MAX;

  const timeBonusesRef = useRef([]);

  const maxScore = useMemo(() => quiz.length * PER_Q_MAX, [quiz.length]);

  const computedScore = useMemo(() => {
    let total = 0;
    for (let i = 0; i < selections.length; i++) {
      const sel = selections[i];
      const q = quiz[i];
      if (!q) continue;
      if (sel === q.answerIndex) {
        total += BASE_POINTS + (timeBonusesRef.current[i] || 0);
      }
    }
    return total;
  }, [selections, quiz]);

  const iq = useMemo(() => {
    if (maxScore <= 0) return 80;
    return 80 + Math.round((computedScore / maxScore) * 60);
  }, [computedScore, maxScore]);

  const cardRef = useRef(null);

  useEffect(() => {
    if (step !== 2 || !started) return;
    if (timeLeft <= 0) {
      onNext();
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, step, started]);

  const startQuiz = () => {
    const shuffled = getShuffledQuestions();
    const picked = sampleQuestions(shuffled, 10);
    setQuiz(picked);
    setSelections(Array(picked.length).fill(null));
    timeBonusesRef.current = Array(picked.length).fill(0);
    setCurrent(0);
    setTimeLeft(20);
    setStarted(true);
    setStep(2);
  };

  const onSelect = (choiceIdx) => {
    const nextSel = selections.slice();
    nextSel[current] = choiceIdx;
    setSelections(nextSel);

    const q = quiz[current];
    if (q && choiceIdx === q.answerIndex) {
      const bonus = Math.max(0, Math.min(TIME_BONUS_MAX, timeLeft));
      timeBonusesRef.current[current] = bonus;
    }

    onNext();
  };

  const onNext = () => {
    const next = current + 1;
    if (next >= quiz.length) {
      setStarted(false);
      setStep(3);
      return;
    }
    setCurrent(next);
    setTimeLeft(20);
  };

  const resetAll = () => {
    setStep(0);
    setHandle("");
    setDisplayName("");
    setQuiz([]);
    setSelections([]);
    setCurrent(0);
    setTimeLeft(20);
    setStarted(false);
    timeBonusesRef.current = [];
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    const nameForFallback =
      displayName || (handle ? `@${handle}` : "Aztec Learner");

    const remoteUrl = candidates[0] ? candidates[0] : displayAvatarSrc;

    try {
      const dataUrl = await fetchToDataURL(remoteUrl);
      setAvatarOverride(dataUrl);
      await new Promise((r) => setTimeout(r, 60));
    } catch {
      setAvatarOverride(initialsDataUrl(nameForFallback));
      await new Promise((r) => setTimeout(r, 40));
    }

    try {
      const png = await htmlToImage.toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `Aztec-IQ-${handle || "anon"}.png`;
      link.href = png;
      link.click();
    } catch (e) {
      alert("Could not generate image. Try again.");
      console.error(e);
    } finally {
      setAvatarOverride(null);
    }
  };

  return (
    <div className="relative min-h-screen w-full text-slate-100 bg-no-repeat bg-cover bg-center bg-[url('./assets/bgPortrait.svg')] md:bg-[url('./assets/bgLandscape1.svg')]">
  {/* stronger translucent overlay to reduce background image opacity */}
  <div className="absolute inset-0 bg-black/60 pointer-events-none" aria-hidden="true" />
      <div className="relative z-10">
      <header className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 grid place-items-center overflow-hidden">
            <img
              src={AZTEC}
              alt="Aztec"
              className="h-full w-full object-cover rounded-full"
              onError={(e) => {
                e.currentTarget.outerHTML = `<div class="text-lg font-semibold text-indigo-200">Az</div>`;
              }}
            />
          </div>
          <h1 className="text-4xl md:text-2xl font-semibold tracking-tight">
            Learn Aztec
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm opacity-80">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Learn</span>
          <span>→</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Quiz</span>
          <span>→</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Share</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-20">
        {step === 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 grid md:grid-cols-2 gap-8 items-center"
          >
            <div className="space-y-5">
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                Learn Aztec. <span className="text-indigo-300">Ace the quiz.</span> Get your Aztec IQ card.
              </h2>
              <p className="text-slate-300/90">
                Explore official Aztec articles inside the app, then take a quiz and get an Aztec IQ card. Your score is calculated with both correct answers and how fast you answer.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 transition font-semibold"
                >
                  Learn
                </button>
                <button
                  onClick={startQuiz}
                  className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition font-semibold text-left"
                >
                  Skip to Quiz
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full" />
              <div className="relative p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <ul className="space-y-3 text-sm">
                  <li>• Official materials from Aztec site & blog</li>
                  <li>• 20-second timer per question</li>
                  <li>• Answer as fast as you can</li>
                </ul>
              </div>
            </div>
          </motion.section>
        )}

        {step === 1 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-semibold">Read: Official Aztec Blogs</h3>
              <button
                onClick={startQuiz}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-semibold"
              >
                I'm Ready → Quiz
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {AZTEC_ARTICLES.map((a, i) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl border border-white/10 bg-white/5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold mb-1">{a.title}</h4>
                      <p className="text-slate-300/90 text-sm">{a.blurb}</p>
                    </div>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 hover:bg-white/20"
                    >
                      Open ↗
                    </a>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-white/10">
                    <iframe
                      src={a.url}
                      title={a.title}
                      className="w-full h-64 bg-black/50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {step === 2 && quiz.length > 0 && (
          <motion.section
            id="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 space-y-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-2xl font-semibold">Quiz</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  Question {current + 1} / {quiz.length}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  ⏱️ {timeLeft}s
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
              <p className="font-medium mb-3">
                Q{current + 1}. {quiz[current].q}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {quiz[current].choices.map((choice, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => onSelect(cIdx)}
                    className="text-left p-4 rounded-xl border transition border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-sm text-slate-300/80">
              Pick an answer before the timer runs out.
            </div>
          </motion.section>
        )}

        {step === 3 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 space-y-6"
          >
            <h3 className="text-2xl font-semibold">Your Aztec IQ Card</h3>
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                  <label className="block text-sm mb-1">
                    X (Twitter) handle — without @
                  </label>
                  <input
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.trim())}
                    placeholder="muhalaw"
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <label className="block text-sm mt-4 mb-1">
                    Display name (optional)
                  </label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Muhalaw"
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-semibold"
                  >
                    Download PNG
                  </button>
                  <button
                    onClick={resetAll}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
                  >
                    Restart
                  </button>
                </div>
                <p className="text-xl text-slate-400">
                  Share on X with #AztecIQ #ZK #Privacy #gAztec
                </p>
              </div>

              <div className="md:justify-self-end">
                <div
                  ref={cardRef}
                  className="w-[480px] h-[270px] rounded-2xl p-4 bg-[url('./assets/Cardbg.png')] bg-cover bg-center border border-white/10 shadow-2xl relative overflow-hidden"
                >
                  {/* overlay to dim card background further */}
                  <div className="absolute inset-0 rounded-2xl bg-black/60 pointer-events-none z-0" aria-hidden="true" />
                  <div className="absolute -top-10 -right-6 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                  <div className="absolute -bottom-16 -left-8 h-48 w-48 rounded-full blur-3xl" />

                  <div className="flex items-center gap-3 relative z-30">
                    <img
                      src={exportAvatarSrc}
                      alt="avatar"
                      className="h-12 w-12 rounded-xl border border-white/20 object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => {
                        if (avatarIdx < candidates.length - 1) {
                          setAvatarIdx((i) => i + 1);
                        } else {
                          setAvatarOverride(
                            initialsDataUrl(
                              displayName ||
                                (handle ? `@${handle}` : "Aztec Learner")
                            )
                          );
                        }
                      }}
                    />
                    <div>
                      <div className="text-xl text-white font-semibold leading-tight">
                        {displayName ||
                          (handle ? `@${handle}` : "Aztec Learner")}
                      </div>
                      <div className="text-xs text-white/70">
                        Aztec Knowledge Passport
                      </div>
                    </div>
                    <div className="ml-auto text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/20">
                      gAztec
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-center z-30">
                    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 p-3">
                      <div className="text-xs text-white/70">Score</div>
                      <div className="text-3xl font-bold">
                        {computedScore}/{maxScore}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 p-3">
                      <div className="text-xs text-white/70">Est. IQ</div>
                      <div className="text-4xl font-bold">{iq}</div>
                    </div>
                    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 p-3">
                      <div className="text-xs text-white/70">Badge</div>
                      <div className="text-2xl font-bold">
                        {computedScore >= maxScore * 0.8
                          ? "Aztec Chad"
                          : computedScore >= maxScore * 0.5
                          ? "Aztec Rookie"
                          : "Aztec Noob"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 text-[10px] text-white opacity-100">
                    • Aztec: The Privacy-first Layer 2 • Powering smart,
                    verifiable applications with Zero-Knowledge proofs
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-4 pb-16 pt-8 text-center text-xs text-slate-400/80">
        With ZK❤️ by {" "}
        <a
          href="https://x.com/muhalaw"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-slate-300 hover:text-white"
        >
          Muhalaw
        </a>
      </footer>
      </div>
    </div>
  );
}