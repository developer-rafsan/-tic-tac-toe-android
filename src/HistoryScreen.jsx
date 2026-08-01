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
import { COLORS, BG_GRADIENT } from './theme';
import { loadHistory, clearHistory } from './history';

const MODE_META = {
  Offline: { icon: '📱' },
  'Auto Play': { icon: '🤖' },
  Online: { icon: '🌐' },
};

const resultColor = (symbol) => {
  if (symbol === 'X') return COLORS.x;
  if (symbol === 'O') return COLORS.o;
  return '#9aa0ae';
};

const formatTime = (ts) => {
  const d = new Date(ts);
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  return `${date}, ${time}`;
};

const HistoryItem = ({ item }) => {
  const color = resultColor(item.symbol);
  const meta = MODE_META[item.mode] || { icon: '🎮' };
  return (
    <View style={styles.item}>
      <View style={[styles.symbolBadge, { backgroundColor: `${color}1a` }]}>
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

const HistoryScreen = ({ onBack }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <LinearGradient colors={BG_GRADIENT} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClear}
            disabled={history.length === 0}
            hitSlop={{ top: 10, bottom: 10 }}
            style={[styles.clearBtn, history.length === 0 && styles.clearBtnDisabled]}
          >
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Your recent games</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="rgba(20,20,43,0.3)" />
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
          renderItem={({ item }) => <HistoryItem item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 8,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textFaint,
  },
  clearBtn: {
    backgroundColor: 'rgba(255,71,87,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  clearBtnDisabled: {
    opacity: 0.4,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.x,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textDim,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 18,
  },
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
  symbolText: {
    fontSize: 20,
    fontWeight: '800',
  },
  itemBody: {
    flex: 1,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemMode: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDim,
  },
  itemTime: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textFaint,
  },
  itemResult: {
    fontSize: 16,
    fontWeight: '800',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyIconText: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textDim,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default HistoryScreen;
