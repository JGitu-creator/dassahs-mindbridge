# Dassah's Prism — Dart & Flutter Technical Assessment & Companion Guide

> **Scope:** Honest technical assessment of Dart/Flutter in the current `dassahs-prism` environment, companion mobile client architecture against the existing Next.js 16 API & Supabase RLS, and a copy-ready Flutter starter scaffold.
>
> **Mandates Preserved:** `PRISM_SHADOW_MODE=false`, Apple Liquid Glass aesthetics, Dastastic & Sovereign focus modes, and zero secret leaks.

---

## 1. Honest Technical Assessment

### 1.1 VM & Toolchain Availability
- **Dart & Flutter SDKs are NOT installed in this development VM:** Running `which dart flutter` produces no output, and there are no Android SDK or Xcode/iOS toolchains present in the container.
- Consequently, Flutter apps cannot be compiled, hot-reloaded, or tested locally inside this VM. Any Flutter build or `flutter test` execution must run either on a developer workstation with Flutter installed or in GitHub Actions CI (see Section 3.4).

### 1.2 Why Dart/Flutter Does Not Run Inside the Next.js Web App
`dassahs-prism` is a **Next.js 16.4.5 (App Router, Turbopack) + React 18.3 + TypeScript 5 + Tailwind CSS v4** web application (`package.json`). Specifically:
1. **Incompatible Rendering Engines:** React renders to the browser DOM via JSX/TSX, whereas Flutter renders to a `<canvas>` (CanvasKit/Skia or SkWasm). Dart/Flutter widgets cannot be mounted natively inside React Server or Client Components (`src/app/page.tsx`).
2. **Liquid Glass & Tailwind v4 Breakage:** `src/app/globals.css` drives the Apple Liquid Glass aesthetic through CSS custom properties (`--glass-blur`, `--glass-saturate`, `--prism-1`..`4`, `[data-sensory-profile="calm"|"vibrant"|"contrast"]`) and `.prism-input` / `.prism-content` typography rules. Embedding Flutter Web via an `<iframe>` or custom element would duplicate the UI runtime, lose Next.js SSR/metadata, add multi-megabyte CanvasKit/WASM download overhead, and break theme/sensory CSS synchronization.
3. **`GEMINI.md` No-Regression Mandate:** Rewriting the web frontend in Flutter Web would violate the `GEMINI.md` **Functionality Preservation** and **No Regression** mandates.

**Decision:** Keep the web UI and current mobile-layout / high-contrast polish phase in **Next.js + TSX + Tailwind CSS v4**, and use **Dart/Flutter as a separate companion native mobile client (iOS & Android)** that consumes `dassahs-prism`'s existing HTTP API and Supabase backend.

---

## 2. Companion Mobile Client Architecture

`dassahs-prism` already separates AI orchestration, document parsing, text-to-speech, and persistence behind clean HTTP endpoints (`src/app/api/*`) and Postgres Row-Level Security (`supabase/migrations/003_neural_vault_items.sql`). A Flutter mobile client plugs into this backend without duplicating any AI keys or business logic.

```
┌──────────────────────────────────────────┐
│   Flutter Companion App (iOS / Android)  │
│  • supabase_flutter (Auth + Vault RLS)   │
│  • dio (Bearer <access_token> HTTP API)  │
│  • flutter_riverpod (Dastastic/Sovereign)│
│  • just_audio (MP3 stream + TTS fallback)│
└───────────────┬──────────────────────────┘
                │ HTTPS (Authorization: Bearer <jwt>)
                ▼
┌──────────────────────────────────────────┐
│  dassahs-prism Next.js API (Vercel)      │
│  • POST /api/simplify                    │
│  • POST /api/chat ("Ask DJ")             │
│  • POST /api/parse (PDF/DOCX/TXT/MD/CSV) │
│  • POST /api/tts (xAI audio/mpeg)        │
│  • POST /api/orchestrator (Scout/Analyst │
│         /Sovereign tiered routing)       │
│  • POST/GET /api/share                   │
│  • GET  /api/user/credits                │
│  • GET  /api/health                      │
└───────────────┬──────────────────────────┘
                │ Service Role / RLS
                ▼
┌──────────────────────────────────────────┐
│  Supabase Postgres + Auth                │
│  • neural_vault_items (RLS: auth.uid())  │
│  • history (shared refractions)          │
│  • user_credits & ai_usage_ledger        │
└──────────────────────────────────────────┘
```

### 2.1 Verified API Endpoints & Contracts

| Endpoint | Source File | Method | Request Payload | Response Payload |
|---|---|---|---|---|
| `/api/simplify` | `src/app/api/simplify/route.ts` | `POST` | `{ text?, mode?, question?, context?, isScenic?, cognitiveMode?, missionGoal?, isStory?, simplicityLevel?, preferredProvider?, imageData?, imageMimeType? }` (150k char max; image <= 14MB) | `{ tldr: string[], whyCare: string, readingTime: string, chunks: Chunk[], actions: Action[], chartData, usage: AiUsage }` (or `{ answer, usage }` if `mode === 'chat'`) |
| `/api/chat` | `src/app/api/chat/route.ts` | `POST` | `{ message: string, history?: Array<{ role, text }>, data?: unknown, preferredProvider? }` | `{ text: string, usage: AiUsage }` |
| `/api/parse` | `src/app/api/parse/route.ts` | `POST` | `multipart/form-data` with `file` (`.pdf`, `.docx`, `.txt`, `.csv`, `.md`, max 10 MB) | `{ text: string }` (up to 100k chars; `413`/`415`/`422` on invalid input) |
| `/api/tts` | `src/app/api/tts/route.ts` | `POST` | `{ text: string, voice_id?: string, language?: string, mood?: 'focused' \| 'soothing' \| 'energetic' \| 'encouraging' }` | `audio/mpeg` binary stream (`503` if `XAI_API_KEY` unset — fall back to device TTS) |
| `/api/orchestrator` | `src/app/api/orchestrator/route.ts` | `POST` | `{ content: string }` | `{ tier: 'Scout' \| 'Analyst' \| 'Sovereign', response: string, choices, resolvedModel? }` (or local metrics fallback) |
| `/api/share` | `src/app/api/share/route.ts` | `POST` / `GET` | `POST`: `{ title?, data, userId? }` • `GET`: `?id=<uuid>` | `POST`: `{ id: string }` • `GET`: `history` row JSON |
| `/api/user/credits` | `src/app/api/user/credits/route.ts` | `GET` | Cookie `sb-access-token` (see §2.2 for mobile Bearer note) | `{ balance: number }` |
| `/api/health` | `PROJECT.md` (M1 Health Contract) | `GET` | None | `{ ok: true, service: 'dassahs-prism', shadowMode: boolean, timestamp: string }` |

### 2.2 Supabase RLS Sync (`neural_vault_items`)
Per `supabase/migrations/003_neural_vault_items.sql`, `public.neural_vault_items` enforces Row-Level Security (`auth.uid() = user_id`) for `SELECT`, `INSERT`, and `DELETE` (`heading <= 120` chars, `content <= 2000` chars, `type IN ('hook', 'metaphor')`). Once `supabase_flutter` signs the user in, the mobile client can query and mutate `neural_vault_items` directly via the Supabase Dart SDK with full multi-tenant isolation.

### 2.3 Exact API Auth Readiness Findings
- **Already Mobile-Ready (`src/lib/ai-quota.ts:20-32`):** `getUserId(req)` already checks `req.headers.get('authorization')` for `Bearer <token>` **before** falling back to `sb-access-token` and `sb-[-\w]+-auth-token` cookies. Therefore, `/api/simplify` and `/api/chat` already authenticate mobile `Authorization: Bearer <jwt>` requests out of the box.
- **One Small Gap for Mobile Billing/Credits (`src/app/api/user/credits/route.ts:7`):** Currently, `GET /api/user/credits` reads only `req.cookies.get('sb-access-token')?.value`. When mobile credit balance checks are enabled, apply this exact 3-line change in `src/app/api/user/credits/route.ts` (replacing line 7):

```ts
const authHeader = req.headers.get('authorization');
const bearer = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
const token = bearer || req.cookies.get('sb-access-token')?.value;
```

- **Guest Trials on Mobile:** `src/lib/ai-quota.ts:34-54` tracks guest trials (`GUEST_TRIAL_LIMIT = 3`) via the `httpOnly` cookie `prism-guest-uses`. Native mobile apps should either require Supabase sign-in or persist cookies using a `dio_cookie_manager` jar if anonymous trials are desired.

---

## 3. Copy-Ready Flutter Companion Starter Scaffold

Place these files in a separate `mobile/` directory or dedicated Flutter repository. All configuration is injected via `--dart-define` so **zero secrets or API keys** are ever hardcoded in source control.

### 3.1 `pubspec.yaml`

```yaml
name: dassahs_prism_mobile
description: Companion iOS/Android client for Dassah's Prism.
publish_to: "none"
version: 0.1.0+1

environment:
  sdk: ">=3.4.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  supabase_flutter: ^2.6.0
  dio: ^5.7.0
  flutter_riverpod: ^2.5.1
  just_audio: ^0.9.40
  file_picker: ^8.1.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
```

### 3.2 `lib/services/prism_api_client.dart`

```dart
import 'dart:typed_data';
import 'package:dio/dio.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class PrismApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'PRISM_API_BASE_URL',
    defaultValue: 'https://dassahs-prism.vercel.app',
  );
}

class PrismApiClient {
  PrismApiClient({Dio? dio, SupabaseClient? supabase})
      : _dio = dio ??
            Dio(BaseOptions(
              baseUrl: PrismApiConfig.baseUrl,
              connectTimeout: const Duration(seconds: 15),
              receiveTimeout: const Duration(seconds: 45),
              headers: const {'Content-Type': 'application/json'},
            )),
        _supabase = supabase ?? Supabase.instance.client;

  final Dio _dio;
  final SupabaseClient _supabase;

  Map<String, String> _authHeaders() {
    final token = _supabase.auth.currentSession?.accessToken;
    if (token == null || token.isEmpty) return const {};
    return {'Authorization': 'Bearer $token'};
  }

  /// GET /api/health
  Future<Map<String, dynamic>> health() async {
    final res = await _dio.get<Map<String, dynamic>>('/api/health');
    return res.data ?? <String, dynamic>{};
  }

  /// POST /api/simplify
  Future<Map<String, dynamic>> simplify({
    required String text,
    String cognitiveMode = 'adhd',
    String missionGoal = 'Discovery',
    String simplicityLevel = 'Standard',
    bool isScenic = false,
    bool isStory = false,
    String preferredProvider = 'auto',
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/api/simplify',
      data: {
        'text': text,
        'cognitiveMode': cognitiveMode,
        'missionGoal': missionGoal,
        'simplicityLevel': simplicityLevel,
        'isScenic': isScenic,
        'isStory': isStory,
        'preferredProvider': preferredProvider,
      },
      options: Options(headers: _authHeaders()),
    );
    return res.data ?? <String, dynamic>{};
  }

  /// POST /api/chat ("Ask DJ")
  Future<Map<String, dynamic>> chat({
    required String message,
    List<Map<String, String>> history = const [],
    Map<String, dynamic>? contextData,
    String preferredProvider = 'auto',
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/api/chat',
      data: {
        'message': message,
        'history': history,
        'data': contextData,
        'preferredProvider': preferredProvider,
      },
      options: Options(headers: _authHeaders()),
    );
    return res.data ?? <String, dynamic>{};
  }

  /// POST /api/orchestrator (Scout / Analyst / Sovereign tiered routing)
  Future<Map<String, dynamic>> orchestrate({required String content}) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/api/orchestrator',
      data: {'content': content},
      options: Options(headers: _authHeaders()),
    );
    return res.data ?? <String, dynamic>{};
  }

  /// POST /api/tts -> returns MP3 bytes, or null if 503 (fallback to device TTS)
  Future<Uint8List?> synthesizeSpeech({
    required String text,
    String mood = 'focused',
    String voiceId = 'eve',
    String language = 'en',
  }) async {
    try {
      final res = await _dio.post<List<int>>(
        '/api/tts',
        data: {
          'text': text,
          'mood': mood,
          'voice_id': voiceId,
          'language': language,
        },
        options: Options(
          headers: _authHeaders(),
          responseType: ResponseType.bytes,
        ),
      );
      final bytes = res.data;
      return bytes == null ? null : Uint8List.fromList(bytes);
    } on DioException catch (e) {
      if (e.response?.statusCode == 503) return null;
      rethrow;
    }
  }
}
```

### 3.3 `lib/main.dart`

```dart
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

enum PrismFocusMode { dastastic, sovereign }

final themeModeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.dark);
final focusModeProvider =
    StateProvider<PrismFocusMode>((ref) => PrismFocusMode.dastastic);

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  const supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  const supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
  if (supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty) {
    await Supabase.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);
  }

  runApp(const ProviderScope(child: DassahsPrismApp()));
}

class DassahsPrismApp extends ConsumerWidget {
  const DassahsPrismApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final focusMode = ref.watch(focusModeProvider);
    final accent = focusMode == PrismFocusMode.sovereign
        ? const Color(0xFFA855F7) // Sovereign Purple
        : const Color(0xFF3B82F6); // Dastastic Blue

    return MaterialApp(
      title: "Dassah's Prism",
      debugShowCheckedModeBanner: false,
      themeMode: themeMode,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        colorScheme: ColorScheme.fromSeed(
          seedColor: accent,
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: accent,
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF09090B),
      ),
      home: const PrismShellScreen(),
    );
  }
}

class PrismShellScreen extends ConsumerWidget {
  const PrismShellScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final focusMode = ref.watch(focusModeProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Dassah's Prism"),
        backgroundColor: Colors.transparent,
        actions: [
          IconButton(
            tooltip: 'Toggle Light/Dark',
            icon: Icon(
              themeMode == ThemeMode.dark ? Icons.light_mode : Icons.dark_mode,
            ),
            onPressed: () {
              ref.read(themeModeProvider.notifier).state =
                  themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Liquid Glass-inspired mode selector
              ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: (isDark ? Colors.white : Colors.black)
                          .withOpacity(isDark ? 0.08 : 0.05),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: cs.primary.withOpacity(0.35),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          focusMode == PrismFocusMode.sovereign
                              ? 'Sovereign Mode — Deep Executive Refraction'
                              : 'Dastastic Mode — ADHD Signal Extraction',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 12),
                        SegmentedButton<PrismFocusMode>(
                          segments: const [
                            ButtonSegment(
                              value: PrismFocusMode.dastastic,
                              label: Text('Dastastic'),
                              icon: Icon(Icons.bolt),
                            ),
                            ButtonSegment(
                              value: PrismFocusMode.sovereign,
                              label: Text('Sovereign'),
                              icon: Icon(Icons.auto_awesome),
                            ),
                          ],
                          selected: {focusMode},
                          onSelectionChanged: (selection) {
                            ref.read(focusModeProvider.notifier).state =
                                selection.first;
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(color: cs.outlineVariant),
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(20),
                    child: Text(
                      'Paste noise or pick a PDF/DOCX/TXT file to refract via POST /api/simplify.',
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

### 3.4 GitHub Actions CI Snippet (`.github/workflows/flutter-companion.yml`)
Because this development VM does not include Dart or Flutter SDKs, run Flutter analysis and tests in GitHub Actions using `subosito/flutter-action`:

```yaml
name: Flutter Companion CI

on:
  push:
    paths:
      - 'mobile/**'
  pull_request:
    paths:
      - 'mobile/**'

jobs:
  analyze-and-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: mobile
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          channel: stable
          cache: true
      - run: flutter pub get
      - run: flutter analyze
      - run: flutter test
```

### 3.5 Running Locally (When Flutter SDK Is Installed)
```bash
flutter run \
  --dart-define=PRISM_API_BASE_URL=https://dassahs-prism.vercel.app \
  --dart-define=SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  --dart-define=SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
```
