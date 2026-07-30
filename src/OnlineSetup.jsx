import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { findServer } from './network';

const OnlineSetup = ({ onBack, onStartGame }) => {
  const [screen, setScreen] = useState('main');
  const [status, setStatus] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const cancelRef = useRef(false);

  const tryFindServer = async () => {
    const conn = await findServer((msg) => {
      if (!cancelRef.current) setStatus(msg);
    });
    return conn;
  };

  const handleHost = async () => {
    setScreen('host');
    cancelRef.current = false;
    setStatus('Connecting to server...');

    const conn = await tryFindServer();
    if (!conn || cancelRef.current) {
      if (!cancelRef.current) {
        setScreen('main');
        Alert.alert(
          'Server Not Found',
          'Make sure server.js is running on your network.\n\nnode server/server.js',
        );
      }
      return;
    }

    conn.send({ type: 'create_room' });
    conn.ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.type === 'room_created') {
        setCreatedCode(data.code);
        setStatus('Waiting for opponent...');
      } else if (data.type === 'opponent_joined') {
        setStatus('');
        onStartGame({
          send: conn.send,
          close: conn.close,
          symbol: 'X',
          isHost: true,
          onMessage: (handler) => { conn.ws.onmessage = (e) => handler(JSON.parse(e.data)); },
        });
      }
    };
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 4) {
      Alert.alert('Invalid Code', 'Please enter a 4-letter room code');
      return;
    }

    setScreen('join');
    cancelRef.current = false;
    setStatus('Connecting to server...');

    const conn = await tryFindServer();
    if (!conn || cancelRef.current) {
      if (!cancelRef.current) {
        setScreen('main');
        Alert.alert(
          'Server Not Found',
          'Make sure server.js is running on your network.\n\nnode server/server.js',
        );
      }
      return;
    }

    conn.send({ type: 'join_room', code });
    conn.ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.type === 'joined') {
        onStartGame({
          send: conn.send,
          close: conn.close,
          symbol: data.symbol || 'O',
          isHost: false,
          onMessage: (handler) => { conn.ws.onmessage = (e) => handler(JSON.parse(e.data)); },
        });
      } else if (data.type === 'error') {
        Alert.alert('Error', data.message);
        conn.close();
        setScreen('main');
      }
    };
  };

  return (
    <LinearGradient colors={['#0F0C29', '#302B63']} style={styles.container}>
      {screen === 'main' && (
        <View style={styles.mainContent}>
          <Text style={styles.title}>Multiplayer</Text>
          <Text style={styles.subtitle}>
            Connect over WiFi or hotspot
          </Text>

          <View style={styles.cards}>
            <TouchableOpacity
              style={styles.card}
              onPress={handleHost}
              activeOpacity={0.8}
            >
              <Text style={styles.cardIcon}>🎮</Text>
              <Text style={styles.cardTitle}>Host Game</Text>
              <Text style={styles.cardDesc}>Create a room for your friend to join</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.inputLabel}>Room Code</Text>
            <TextInput
              style={styles.input}
              value={joinCode}
              onChangeText={(t) => setJoinCode(t.toUpperCase())}
              placeholder="ABCD"
              placeholderTextColor="rgba(255,255,255,0.25)"
              autoCapitalize="characters"
              maxLength={4}
            />
            <TouchableOpacity
              style={[styles.card, styles.joinCard]}
              onPress={handleJoin}
              activeOpacity={0.8}
            >
              <Text style={styles.cardIcon}>🔗</Text>
              <Text style={styles.cardTitle}>Join Game</Text>
              <Text style={styles.cardDesc}>Enter a room code to play</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>⟵ Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {(screen === 'host' || screen === 'join') && (
        <View style={styles.statusContent}>
          {createdCode ? (
            <>
              <Text style={styles.codeLabel}>Share this code</Text>
              <View style={styles.codeBox}>
                <Text style={styles.code}>{createdCode}</Text>
              </View>
              <View style={styles.statusRow}>
                <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
                <Text style={styles.statusText}>{status}</Text>
              </View>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color="rgba(255,255,255,0.6)" />
              <Text style={styles.statusLabel}>{status}</Text>
            </>
          )}
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>⟵ Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    marginBottom: 32,
  },
  cards: {
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 6,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  joinCard: {
    marginTop: 4,
  },
  backBtn: {
    alignSelf: 'center',
    paddingVertical: 14,
    marginTop: 24,
    marginBottom: 20,
  },
  backBtnText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 15,
    fontWeight: '500',
  },
  statusContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    marginBottom: 12,
  },
  codeBox: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 16,
    paddingHorizontal: 36,
    marginBottom: 20,
  },
  code: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  statusLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    marginTop: 16,
  },
});

export default OnlineSetup;
