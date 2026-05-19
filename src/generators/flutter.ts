import type { GenerateFunction } from "./types";
import { toPascalCase } from "../utils/stringUtils";

const radiusValue = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24
};

const paddingValue = {
  compact: 16,
  comfortable: 24,
  spacious: 32
};

export const generateFlutter: GenerateFunction = ({ template, config }) => {
  const className = toPascalCase(template.name);
  const primary = flutterColor(config.primaryColor);
  const bg = config.theme === "dark" ? "const Color(0xFF09090B)" : "Colors.white";
  const text = config.theme === "dark" ? "Colors.white" : "const Color(0xFF18181B)";
  const muted = config.theme === "dark" ? "const Color(0xFFA1A1AA)" : "const Color(0xFF52525B)";
  const surface = config.theme === "dark" ? "const Color(0xFF18181B)" : "Colors.white";
  const borderRadius = radiusValue[config.radius];
  const padding = paddingValue[config.density];

  return `import 'package:flutter/material.dart';

class ${className} extends StatelessWidget {
  const ${className}({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ${bg},
      body: SafeArea(
        child: ${renderFlutterBody(template.id, {
          primary,
          text,
          muted,
          surface,
          borderRadius,
          padding
        })}
      ),
    );
  }
}

class _ProfileStat extends StatelessWidget {
  const _ProfileStat({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label, style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }
}
`;
};

function flutterColor(hex: string): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 6 ? `FF${clean}` : clean.padStart(8, "F");
  return "Color(0x" + full.toUpperCase() + ")";
}

interface FlutterTokens {
  primary: string;
  text: string;
  muted: string;
  surface: string;
  borderRadius: number;
  padding: number;
}

function renderFlutterBody(templateId: string, tokens: FlutterTokens): string {
  switch (templateId) {
    case "login-card":
      return `Center(
          child: Padding(
            padding: const EdgeInsets.all(${tokens.padding}),
            child: Card(
              color: ${tokens.surface},
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(${tokens.borderRadius})),
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    CircleAvatar(radius: 28, backgroundColor: ${tokens.primary}),
                    const SizedBox(height: 20),
                    Text('Welcome back', textAlign: TextAlign.center, style: TextStyle(color: ${tokens.text}, fontSize: 26, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text('Sign in to continue to your workspace.', textAlign: TextAlign.center, style: TextStyle(color: ${tokens.muted})),
                    const SizedBox(height: 24),
                    const TextField(decoration: InputDecoration(labelText: 'Email')),
                    const SizedBox(height: 12),
                    const TextField(obscureText: true, decoration: InputDecoration(labelText: 'Password')),
                    const SizedBox(height: 20),
                    ElevatedButton(onPressed: () {}, style: ElevatedButton.styleFrom(backgroundColor: ${tokens.primary}), child: const Text('Sign in')),
                  ],
                ),
              ),
            ),
          ),
        )`;

    case "mobile-profile-screen":
      return `ListView(
          padding: const EdgeInsets.all(${tokens.padding}),
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: ${tokens.surface}, borderRadius: BorderRadius.circular(${tokens.borderRadius})),
              child: Column(
                children: [
                  Row(
                    children: [
                      CircleAvatar(radius: 34, backgroundColor: ${tokens.primary}),
                      const SizedBox(width: 16),
                      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('Alex Morgan', style: TextStyle(color: ${tokens.text}, fontSize: 22, fontWeight: FontWeight.bold)),
                        Text('Product designer', style: TextStyle(color: ${tokens.muted})),
                      ]),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: const [
                      _ProfileStat(value: '24', label: 'Projects'),
                      _ProfileStat(value: '1.8k', label: 'Followers'),
                      _ProfileStat(value: '128', label: 'Shots'),
                    ],
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(onPressed: () {}, style: ElevatedButton.styleFrom(backgroundColor: ${tokens.primary}, minimumSize: const Size.fromHeight(48)), child: const Text('Follow')),
                ],
              ),
            ),
          ],
        )`;

    case "mobile-settings-screen":
      return `ListView(
          padding: const EdgeInsets.all(${tokens.padding}),
          children: [
            Text('Settings', style: TextStyle(color: ${tokens.text}, fontSize: 28, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            ...['Notifications', 'Privacy', 'Appearance', 'Billing'].map((item) => Card(
              color: ${tokens.surface},
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(${tokens.borderRadius})),
              child: ListTile(
                title: Text(item, style: TextStyle(color: ${tokens.text})),
                trailing: Icon(Icons.chevron_right, color: ${tokens.muted}),
              ),
            )),
          ],
        )`;

    case "mobile-bottom-navigation":
      return `Column(
          children: [
            Expanded(
              child: Container(
                margin: const EdgeInsets.all(${tokens.padding}),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: ${tokens.surface}, borderRadius: BorderRadius.circular(${tokens.borderRadius})),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Home', style: TextStyle(color: ${tokens.text}, fontSize: 28, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text('Mobile app content area.', style: TextStyle(color: ${tokens.muted})),
                ]),
              ),
            ),
            BottomNavigationBar(
              selectedItemColor: ${tokens.primary},
              unselectedItemColor: ${tokens.muted},
              items: const [
                BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
                BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
                BottomNavigationBarItem(icon: Icon(Icons.bookmark_border), label: 'Saved'),
                BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Profile'),
              ],
            ),
          ],
        )`;

    case "account-settings-panel":
      return `ListView(
          padding: const EdgeInsets.all(${tokens.padding}),
          children: [
            Text('Account settings', style: TextStyle(color: ${tokens.text}, fontSize: 28, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Manage profile, preferences, and notifications.', style: TextStyle(color: ${tokens.muted})),
            const SizedBox(height: 24),
            const TextField(decoration: InputDecoration(labelText: 'Display name')),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Email')),
            const SizedBox(height: 20),
            ElevatedButton(onPressed: () {}, style: ElevatedButton.styleFrom(backgroundColor: ${tokens.primary}), child: const Text('Save changes')),
          ],
        )`;

    case "empty-state-card":
    default:
      return `Center(
          child: Padding(
            padding: const EdgeInsets.all(${tokens.padding}),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircleAvatar(radius: 30, backgroundColor: ${tokens.primary}, child: const Icon(Icons.add, color: Colors.white)),
                const SizedBox(height: 20),
                Text('Nothing here yet', style: TextStyle(color: ${tokens.text}, fontSize: 24, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('Create a new item to get started.', textAlign: TextAlign.center, style: TextStyle(color: ${tokens.muted})),
                const SizedBox(height: 20),
                ElevatedButton(onPressed: () {}, style: ElevatedButton.styleFrom(backgroundColor: ${tokens.primary}), child: const Text('Create item')),
              ],
            ),
          ),
        )`;
  }
}
