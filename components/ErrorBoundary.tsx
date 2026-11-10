import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './ErrorBoundary.styles';

// expo-updates may not be present in all build configs — import lazily
let reloadAsync: (() => Promise<void>) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  reloadAsync = require('expo-updates').reloadAsync;
} catch {
  // not available (e.g. bare Expo Go dev client without updates)
}

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught render error:', error, info);
  }

  private handleReload = (): void => {
    if (reloadAsync) {
      reloadAsync().catch(console.error);
    } else {
      // Fallback: reset boundary state so the tree re-mounts
      this.setState({ hasError: false });
    }
  };

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.title} accessibilityRole="header">
          Something went wrong
        </Text>
        <Text style={styles.message}>
          An unexpected error occurred. Reloading the app usually fixes this.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={this.handleReload}
          accessibilityRole="button"
          accessibilityLabel="Reload app"
        >
          <Text style={styles.buttonText}>Reload app</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
