import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
console.log("DEBUG: GEMINI_API_KEY =", process.env.GEMINI_API_KEY ? `EXISTS (length: ${process.env.GEMINI_API_KEY.length}, starts with: ${process.env.GEMINI_API_KEY.substring(0, 5)})` : "UNDEFINED");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Endpoint to migrate legacy code
app.post("/api/migrate", async (req, res) => {
  try {
    const { sourceCode, sourceLang, targetLang, options = [] } = req.body;

    if (!sourceCode) {
      return res.status(400).json({ error: "Source code is required." });
    }

    const optionsStr = options.length > 0 
      ? `Apply the following additional optimization parameters: ${options.join(", ")}.`
      : "";

    const systemInstruction = `You are an elite, autonomous BridgeBot specializing in zero-downtime, high-fidelity software modernization.
Your core objective is to analyze legacy codebases (e.g., COBOL, legacy Java, Fortran, Pascal, PHP 5.x) and automatically transform them into modern, idiomatic, and highly optimized target stacks (e.g., Go, Python 3.12, TypeScript, Rust, Modern C++).
You aim to slash technical debt while preserving absolute functional parity.

CORE CAPABILITIES:
1. Deep Semantic Analysis: Understand underlying business logic, state management, and data flow.
2. Modern Stack Optimization: Leverage native modern features (e.g., Go channels, Python 3.12 generics, strict type hinting, proper concurrency).
3. Technical Debt Reduction: Simplify deeply nested loops, remove dead code, replace deprecated modules.
4. Safety & Security Auditing: Fix legacy security vulnerabilities (buffer overflows, injection flaws, unsafe memory access).

Your output MUST be a strict JSON object matching the requested schema.`;

    const prompt = `Perform high-fidelity code migration on the following legacy code:
Source Language: ${sourceLang}
Target Language: ${targetLang}

--- SOURCE CODE ---
${sourceCode}
-------------------

${optionsStr}

Ensure the modernized code is highly readable, idiomatic, uses modern packages/standards, contains extensive helpful comments, and preserves functional parity perfectly.

You must reply with a valid JSON object matching this schema:
{
  "modernCode": "The complete, ready-to-use, well-commented modernized source code",
  "architecturalSummary": {
    "legacyParadoxesResolved": ["Array of legacy bottlenecks or anti-patterns eliminated"],
    "targetStackFeatures": ["Array of modern target language features utilized"]
  },
  "refactoringDetails": {
    "nestedLoopsSimplified": "Explanation of how nested loops or complex flows were streamlined",
    "deadCodeRemoved": "Details about legacy boilerplate or unused code removed",
    "cleanArchitectureApplied": "How modern SOLID or architectural principles were injected"
  },
  "securityAudit": {
    "vulnerabilitiesFound": [
      {
        "issue": "Title of vulnerability or unsafe pattern in the legacy code",
        "severity": "High" | "Medium" | "Low",
        "description": "Detailed explanation of the safety concern in the legacy source",
        "resolution": "How it is fixed or mitigated in the target modernized source code"
      }
    ]
  },
  "unitTests": "A complete, idiomatic test suite or unit tests for the modernized code",
  "performanceComparison": {
    "legacy": { "memory": "High/Moderate/Low description", "cpuEfficiency": "Inefficient/Normal/Highly Efficient", "linesOfCode": estimated lines of code },
    "modern": { "memory": "Optimized description", "cpuEfficiency": "Optimized description", "linesOfCode": actual lines of code }
  }
}`;

    // Call Gemini API using gemini-3.5-flash for reliability and fast responses without requiring paid model flow.
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            modernCode: { type: Type.STRING },
            architecturalSummary: {
              type: Type.OBJECT,
              properties: {
                legacyParadoxesResolved: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                targetStackFeatures: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["legacyParadoxesResolved", "targetStackFeatures"]
            },
            refactoringDetails: {
              type: Type.OBJECT,
              properties: {
                nestedLoopsSimplified: { type: Type.STRING },
                deadCodeRemoved: { type: Type.STRING },
                cleanArchitectureApplied: { type: Type.STRING }
              },
              required: ["nestedLoopsSimplified", "deadCodeRemoved", "cleanArchitectureApplied"]
            },
            securityAudit: {
              type: Type.OBJECT,
              properties: {
                vulnerabilitiesFound: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      issue: { type: Type.STRING },
                      severity: { type: Type.STRING },
                      description: { type: Type.STRING },
                      resolution: { type: Type.STRING }
                    },
                    required: ["issue", "severity", "description", "resolution"]
                  }
                }
              },
              required: ["vulnerabilitiesFound"]
            },
            unitTests: { type: Type.STRING },
            performanceComparison: {
              type: Type.OBJECT,
              properties: {
                legacy: {
                  type: Type.OBJECT,
                  properties: {
                    memory: { type: Type.STRING },
                    cpuEfficiency: { type: Type.STRING },
                    linesOfCode: { type: Type.INTEGER }
                  },
                  required: ["memory", "cpuEfficiency", "linesOfCode"]
                },
                modern: {
                  type: Type.OBJECT,
                  properties: {
                    memory: { type: Type.STRING },
                    cpuEfficiency: { type: Type.STRING },
                    linesOfCode: { type: Type.INTEGER }
                  },
                  required: ["memory", "cpuEfficiency", "linesOfCode"]
                }
              },
              required: ["legacy", "modern"]
            }
          },
          required: ["modernCode", "architecturalSummary", "refactoringDetails", "securityAudit", "unitTests", "performanceComparison"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response received from Gemini.");
    }

    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Migration error:", error);
    res.status(500).json({ error: error.message || "An error occurred during code migration." });
  }
});

// Endpoint to refine or chat about the migrated code
app.post("/api/refine", async (req, res) => {
  try {
    const { sourceCode, modernCode, message, sourceLang, targetLang } = req.body;

    if (!modernCode || !message) {
      return res.status(400).json({ error: "Migrated code and refinement instruction are required." });
    }

    const systemInstruction = `You are an elite, autonomous BridgeBot.
You have already migrated some legacy code in ${sourceLang} to modern, optimized ${targetLang}.
The user is now asking you to refine or answer questions about the modernized code.
Provide highly specialized, professional, and directly actionable guidance. Return the modernized code if they asked for changes, or provide code snippets within explanations.

Your output MUST be a strict JSON object matching this schema:
{
  "explanation": "A concise, developer-friendly explanation answering their question or describing the refinement made. Focus on high-level architecture and functional outcomes without technical fluff.",
  "refinedCode": "The updated modernized code (or the original if no changes were needed)"
}`;

    const prompt = `Refinement Session:
Legacy Language: ${sourceLang}
Target Language: ${targetLang}

--- LEGACY SOURCE ---
${sourceCode || "(Not provided)"}
---------------------

--- CURRENT MODERN CODE ---
${modernCode}
---------------------------

User Request / Question: ${message}

Act upon their instruction, perform any requested refactorings or explain concepts clearly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            refinedCode: { type: Type.STRING }
          },
          required: ["explanation", "refinedCode"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response received from Gemini.");
    }

    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Refinement error:", error);
    res.status(500).json({ error: error.message || "An error occurred during refinement." });
  }
});

// Setup Vite Dev Server / Static Asset serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
