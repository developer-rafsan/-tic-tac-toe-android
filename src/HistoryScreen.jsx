import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from './theme';
import ThemeToggle from './ThemeToggle';
import LightOrbs from './LightOrbs';
import { loadHistory, clearHistory } from './history';

const MODE_META = {
  Offline: { icon: '📱' },
  'Auto Play': { icon: '🤖' },
  Online: { icon: '🌐' },
};

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 24 },
    header: { paddingTop: 8, marginBottom: 8 },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 18,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    backText: { fontSize: 14, fontWeight: '500', color: colors.textFaint },
    clearBtn: {
      backgroundColor: 'rgba(255,71,87,0.12)',
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 12,
    },
    clearBtnDisabled: { opacity: 0.4 },
    clearText: { fontSize: 13, fontWeight: '700', color: colors.x },
    title: { fontSize: 34, fontWeight: '800', color: colors.text },
    subtitle: { fontSize: 14, color: colors.textDim, fontWeight: '500', marginTop: 2, marginBottom: 18 },
    list: { paddingBottom: 24, gap: 12 },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    symbolBadge: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    symbolText: { fontSize: 20, fontWeight: '800' },
    itemBody: { flex: 1 },
    itemTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    itemMode: { fontSize: 13, fontWeight: '700', color: colors.textDim },
    itemTime: { fontSize: 12, fontWeight: '500', color: colors.textFaint },
    itemResult: { fontSize: 16, fontWeight: '800' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 18,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    emptyIconText: { fontSize: 36 },
    emptyTitle: { fontSize: 19, fontWeight: '800', color: colors.text, marginBottom: 4 },
    emptySub: { fontSize: 14, color: colors.textDim, fontWeight: '500', textAlign: 'center' },
  });

const HistoryItem = ({ item, colors, styles }) => {
  const color = item.symbol === 'X' ? colors.x : item.symbol === 'O' ? colors.o : colors.textFaint;
  const meta = MODE_META[item.mode] || { icon: '🎮' };
  return (
    <View style={styles.item}>
      <View style={[styles.symbolBadge, { backgroundColor: `${color}1f` }]}>
        <Text style={[styles.symbolText, { color }]}>{item.symbol}</Text>
      </View>
      <View style={styles.itemBody}>
        <View style={styles.itemTop}>
          <Text style={styles.itemMode}>
            {meta.icon} {item.mode}
          </Text>
          <Text style={styles.itemTime}>{formatTime(item.timestamp)}</Text>
        </View>
        <Text style={[styles.itemResult, { color }]}>{item.text}</Text>
      </View>
    </View>
  );
};

const formatTime = (ts) => {
  const d = new Date(ts);
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  return `${date}, ${time}`;
};

const HistoryScreen = ({ onBack }) => {
  const { colors, gradients } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const load = useCallback(async () => {
    const items = await loadHistory();
    setHistory(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleClear = () => {
    Alert.alert('Clear History', 'All saved games will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          setHistory([]);
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={gradients.bg} style={styles.container}>
      <LightOrbs />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={handleClear}
              disabled={history.length === 0}
              hitSlop={{ top: 10, bottom: 10 }}
              style={[styles.clearBtn, history.length === 0 && styles.clearBtnDisabled]}
            >
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
            <ThemeToggle />
          </View>
        </View>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Your recent games</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.textFaint} />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>🎮</Text>
          </View>
          <Text style={styles.emptyTitle}>No games yet</Text>
          <Text style={styles.emptySub}>Play a game and it will show up here</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryItem item={item} colors={colors} styles={styles} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
};

export default HistoryScreen;
