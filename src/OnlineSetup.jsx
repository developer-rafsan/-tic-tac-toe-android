import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { findServer, connectRelay } from './network';
import { BG_GRADIENT } from './theme';

const X_COLOR = '#ff4757';
const O_COLOR = '#2ed573';

const OnlineSetup = ({ onBack, onStartGame }) => {
  const [screen, setScreen] = useState('main');
  const [status, setStatus] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const cancelRef = useRef(false);

  const connectAndSend = async (msg) => {
    const relay = await connectRelay((m) => { if (!cancelRef.current) setStatus(m); });
    if (relay) return relay;
    const local = await findServer((m) => { if (!cancelRef.current) setStatus(m); });
    return local;
  };

  const handleHost = async () => {
    setScreen('host');
    cancelRef.current = false;
    setStatus('Connecting...');

    const conn = await connectAndSend();
    if (!conn || cancelRef.current) {
      if (!cancelRef.current) { setScreen('main'); Alert.alert('Server Not Found', 'Make sure the server is running'); }
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
        onStartGame({ send: conn.send, close: conn.close, symbol: 'X', isHost: true, onMessage: (handler) => { conn.ws.onmessage = (e) => handler(JSON.parse(e.data)); } });
      }
    };
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 4) { Alert.alert('Invalid Code', 'Enter a 4-letter room code'); return; }

    setScreen('join');
    cancelRef.current = false;
    setStatus('Connecting...');

    const conn = await connectAndSend();
    if (!conn || cancelRef.current) {
      if (!cancelRef.current) { setScreen('main'); Alert.alert('Server Not Found', 'Make sure the server is running'); }
      return;
    }

    conn.send({ type: 'join_room', code });
    conn.ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.type === 'error') { Alert.alert('Error', data.message); conn.close(); setScreen('main'); }
      if (data.type === 'joined') {
        onStartGame({ send: conn.send, close: conn.close, symbol: data.symbol || 'O', isHost: false, onMessage: (handler) => { conn.ws.onmessage = (e) => handler(JSON.parse(e.data)); } });
      }
    };
  };

  return (
    <LinearGradient colors={BG_GRADIENT} style={styles.container}>
      {screen === 'main' ? (
        <View style={styles.mainContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Multiplayer</Text>
            <Text style={styles.subtitle}>Connect over WiFi or hotspot</Text>
          </View>

          <View style={styles.section}>
            <TouchableOpacity style={styles.card} onPress={handleHost} activeOpacity={0.92}>
              <View style={[styles.cardAccent, { backgroundColor: X_COLOR }]} />
              <View style={styles.cardContent}>
                <View style={styles.cardIconWrap}><Text style={styles.cardIcon}>🎮</Text></View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Host Game</Text>
                  <Text style={styles.cardDesc}>Create a room & share the code</Text>
                </View>
              </View>
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
              placeholderTextColor="rgba(0,0,0,0.15)"
              autoCapitalize="characters"
              maxLength={4}
            />
            <TouchableOpacity style={styles.joinCard} onPress={handleJoin} activeOpacity={0.92}>
              <View style={[styles.cardAccent, { backgroundColor: O_COLOR }]} />
              <View style={styles.cardContent}>
                <View style={styles.cardIconWrap}><Text style={styles.cardIcon}>🔗</Text></View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Join Game</Text>
                  <Text style={styles.cardDesc}>Enter a room code to play</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.statusContent}>
          <View style={styles.statusCard}>
            {createdCode ? (
              <>
                <Text style={styles.codeLabel}>Share this code</Text>
                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>{createdCode}</Text>
                </View>
                <View style={styles.statusRow}>
                  <ActivityIndicator size="small" color="rgba(0,0,0,0.3)" />
                  <Text style={styles.statusLabel}>{status}</Text>
                </View>
              </>
            ) : (
              <>
                <ActivityIndicator size="large" color="rgba(0,0,0,0.3)" />
                <Text style={[styles.statusLabel, styles.statusLabelTop]}>{status}</Text>
              </>
            )}
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>← Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f5f9', paddingHorizontal: 24 },
  mainContent: { flex: 1, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: 34, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'rgba(0,0,0,0.4)', fontWeight: '500' },
  section: { gap: 14 },
  card: { backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  joinCard: { backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  cardAccent: { width: 5 },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingRight: 18, paddingLeft: 14, gap: 14 },
  cardIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f2f5f9', justifyContent: 'center', alignItems: 'center' },
  cardIcon: { fontSize: 20 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a2e', marginBottom: 2 },
  cardDesc: { fontSize: 13, color: 'rgba(0,0,0,0.4)', fontWeight: '500' },
  divider: { flexDirection: 'row', alignItems: 'center' },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.06)' },
  dividerText: { marginHorizontal: 16, color: 'rgba(0,0,0,0.25)', fontSize: 12, fontWeight: '600' },
  inputLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(0,0,0,0.4)', marginBottom: 8 },
  input: { width: '100%', backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14, fontSize: 24, color: '#1a1a2e', textAlign: 'center', letterSpacing: 8, fontWeight: '800', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 },
  backBtn: { alignSelf: 'center', paddingVertical: 14, marginTop: 28, marginBottom: 20 },
  backBtnText: { color: 'rgba(0,0,0,0.3)', fontSize: 14, fontWeight: '500' },
  statusContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingVertical: 32, paddingHorizontal: 36, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  codeLabel: { fontSize: 13, color: 'rgba(0,0,0,0.4)', fontWeight: '500', marginBottom: 14 },
  codeBox: { backgroundColor: '#f2f5f9', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginBottom: 20 },
  codeText: { fontSize: 46, fontWeight: '800', color: '#1a1a2e', letterSpacing: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusLabel: { fontSize: 14, color: 'rgba(0,0,0,0.45)', fontWeight: '500' },
  statusLabelTop: { marginTop: 16 },
});

export default OnlineSetup;
