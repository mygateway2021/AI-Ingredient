# AI-Ingredient

## Implementation plan (4 phases)

This plan delivers an Android/iOS React Native app that scans food ingredient tables and provides health suggestions, warnings, and purchase alternatives. It supports both cloud AI models and an on-device small model, with privacy-first defaults and offline capability.

### Phase 1 — App foundation and OCR capture

- Tech stack
	- React Native (TypeScript), React Navigation, light/dark theme
	- Camera capture: react-native-image-picker (launch camera to take a photo)
	- OCR (on-device first): ML Kit Text Recognition via @react-native-ml-kit/text-recognition (Android/iOS); fallback: Tesseract or platform APIs (Vision on iOS)
	- State: Zustand or Redux Toolkit; Storage: MMKV for user prefs; SQLite (e.g., WatermelonDB) for scan history
- Features
	- Screens: Scan, Result, History, Profile, Settings
	- Capture a photo with camera and run on-device OCR; barcode reader as optional input (later)
	- Local-only processing by default; send only extracted text (not images) when cloud is enabled
- Deliverables
	- RN app skeleton and navigation
	- OCR pipeline producing raw text and bounding boxes per line
	- Basic error handling, permission flows, and minimal UI
- Success criteria
	- 95%+ OCR success on clear, well-lit labels; graceful fallback on low light

### Phase 2 — Ingredient parsing and health rules

- Parsing and normalization
	- Tokenize and normalize ingredients (lowercase, trim, split on commas/semicolons)
	- Expand synonyms (e.g., “E621” → “monosodium glutamate”) and canonicalize units
	- Extract may-contain and allergen statements; detect sugar/salt/artificial sweeteners
- Knowledge base (KB)
	- Curated JSON KB of additives, allergens, dietary tags (vegan, keto, halal, etc.), and regulatory notes with citations
	- Score model: hazard score per ingredient + aggregate product score; severity bands (info, caution, avoid)
- Rule engine
	- Deterministic checks derived from KB + user profile (allergies, dietary preferences, pregnancy, conditions like hypertension/diabetes)
	- Output structured JSON: normalizedIngredients[], flags[], score, reasons[], citations[]
- Deliverables
	- KB v1 (JSON, versioned) + parser/normalizer library
	- Rule engine with unit tests and snapshot tests for typical labels
- Success criteria
	- Deterministic results reproducible offline; 90%+ agreement with predefined golden cases

### Phase 3 — AI suggestions: cloud + local model

- Model Router & contracts
	- Define a single Suggestion API returning JSON: warnings, personalized tips, and actionable swaps (schema-first)
	- Providers:
		- Cloud LLM: Azure OpenAI/Anthropic (fast, higher quality, function-calling to JSON)
		- Local small model: MLC LLM (1.5–3B quantized) or ONNX Runtime Mobile model fine-tuned for classification/summarization
	- Routing policy: user setting + connectivity/latency caps + privacy level; failover from cloud → local; cache last N prompts/results
- Prompts & grounding
	- Ground the model with structured parser output and KB facts to avoid hallucinations
	- Require JSON output with citations and severity mapping
	- Content guardrails: safe, non-judgmental health guidance; no medical diagnosis
- Deliverables
	- ModelRouter with pluggable providers, timeouts, retries
	- On-device model packaging and load/unload lifecycle with memory limits
	- Privacy toggles (local-only vs. cloud-enhanced) and transparent disclosures
- Success criteria
	- p50 end-to-end suggestion latency: <2.5s (cloud) / <4.5s (local) on mid-tier devices
	- 0 crashes under 30-min stress test; consistent JSON contract

### Phase 4 — Product recommendations and commerce

- Discovery
	- Barcode scanning for quick product lookup (OpenFoodFacts)
	- Search by name/category; match by ingredient profile and KB flags
- Alternatives and purchase
	- Generate “cleaner” alternatives with fewer flags; explain trade-offs
	- Outbound deep links to retailers (Phase 4a), partner APIs for prices/availability (Phase 4b)
	- Offline cache of recent products and alternatives
- UX and analytics
	- A/B test suggestion phrasing; opt-in analytics; no PII logged
- Deliverables
	- Product lookup, alternatives ranking, and link-out flow
	- Caching layer and retry/backoff for flaky networks
- Success criteria
	- Meaningful alternative shown for ≥70% of scanned items (in supported locales)

## Architecture highlights

- Modules
	- capture-ocr: camera + OCR normalization
	- parse-normalize: ingredient parsing and canonicalization
	- kb-engine: KB data + deterministic rules/scoring
	- ai-suggest: ModelRouter (cloud/local) + prompt/JSON schema
	- product-reco: product lookup, alt generation, and ranking
	- app-shell: navigation, settings, storage, profiles
- Privacy & data flow
	- Default local-only; cloud sends text and derived facts only (no images), with user consent
	- All network calls behind a single gateway with retry/backoff
- Testing & release
	- Unit: Jest; E2E: Detox
	- CI/CD: GitHub Actions; delivery via fastlane (iOS) and Play Console; feature flags for staged rollout

## Risks and mitigations

- OCR variability → Use line bounding boxes and allow manual corrections; enhance with language models for cleanup
- On-device model size/latency → Quantize and cap model size; switch to deterministic template if memory pressure detected
- Data coverage (KB) → Seed with OpenFoodFacts + curated additive lists; enable remote updates with version pinning
- Partner dependencies → Start with open data, add partners later via feature flags

## Acceptance checklist per phase

- Measurable latency targets met on a mid-tier device
- Deterministic JSON contracts validated with tests
- Privacy settings honored (local-only vs cloud)
- Crash-free hours and E2E coverage on core flows

## How to run (Phase 1)

- Prereqs
	- Android SDK + emulator or Android device, Node 18+, Java 17
	- For iOS builds, use a Mac with Xcode and CocoaPods (pod install in `ios/`)
- Install and run (Android)
	1. cd AIIngredient
	2. npm install
	3. npm run android
- Notes
	- On the first run, accept camera permissions. Use the Scan screen’s “Open Camera” button to capture and OCR the label.
	- iOS requires running `cd ios && pod install` before building.

## Troubleshooting (Android)

- Error: Android Gradle plugin requires Java 17 to run
	- Install JDK 17 (Temurin or Microsoft OpenJDK). Then set it for the session:
		```pwsh
		$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17\"
		$env:Path = "$env:JAVA_HOME\bin;$env:Path"
		npm run android
		```
	- Or set Gradle to use it persistently by adding this to `android/gradle.properties` (update the path to your JDK):
		```
		org.gradle.java.home=C:\\Program Files\\Eclipse Adoptium\\jdk-17
		```
- Error: peer not authenticated while fetching from Maven Central
	- We enable Windows root trust store via Gradle JVM args. If you’re behind a proxy, also set:
		```
		systemProp.http.proxyHost=YOUR_PROXY
		systemProp.http.proxyPort=8080
		systemProp.https.proxyHost=YOUR_PROXY
		systemProp.https.proxyPort=8080
		```