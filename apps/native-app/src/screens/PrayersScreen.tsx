import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { useAppContext, usePrayerTimesContext, Prayer, PrayerFardStatus, Nawafil, NawafilStatus, storage } from '@mahyay/core';
import GlassCard from '../components/GlassCard';

const FardhPrayerDetail: React.FC<{ prayer: Prayer }> = ({ prayer }) => {
    const { dailyData, updatePrayerStatus, updateSunnahStatus } = useAppContext();
    const { prayerTimes } = usePrayerTimesContext();
    const status = dailyData.prayerData[prayer.name];
    
    const prayerTimeStr = prayerTimes[prayer.name];

    const statusButtons: { key: PrayerFardStatus; label: string; style: any }[] = [
        { key: 'early', label: '🌟 أول الوقت', style: styles.statusBtnEarly },
        { key: 'ontime', label: '✅ في الوقت', style: styles.statusBtnOnTime },
        { key: 'late', label: '⚠️ بعد الوقت', style: styles.statusBtnLate },
        { key: 'missed', label: '❌ لم أصل', style: styles.statusBtnMissed },
    ];

    return (
        <View style={styles.detailContainer}>
            <Text style={styles.detailTitle}>{prayer.emoji} {prayer.name}</Text>
            <Text style={styles.detailTime}>{prayerTimeStr || '...'}</Text>
            
            <View style={styles.statusButtonsContainer}>
                {statusButtons.map(btn => (
                    <TouchableOpacity 
                        key={btn.key} 
                        onPress={() => updatePrayerStatus(prayer.name, btn.key)} 
                        style={[styles.statusButton, status.fard === btn.key && btn.style]}
                    >
                        <Text style={[styles.statusButtonText, status.fard === btn.key && styles.statusButtonTextActive]}>{btn.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.sunnahContainer}>
                {prayer.sunnahBefore && (
                    <View style={styles.sunnahRow}>
                        <Text style={styles.sunnahLabel}>سنة قبلية ({prayer.sunnahBefore.count})</Text>
                        <Switch value={status.sunnahBefore} onValueChange={() => updateSunnahStatus(prayer.name, 'sunnahBefore')} trackColor={{ false: "#767577", true: "#fde047" }} thumbColor={status.sunnahBefore ? "#f59e0b" : "#f4f3f4"} />
                    </View>
                )}
                 {prayer.sunnahAfter && (
                     <View style={styles.sunnahRow}>
                        <Text style={styles.sunnahLabel}>سنة بعدية ({prayer.sunnahAfter.count})</Text>
                        <Switch value={status.sunnahAfter} onValueChange={() => updateSunnahStatus(prayer.name, 'sunnahAfter')} trackColor={{ false: "#767577", true: "#fde047" }} thumbColor={status.sunnahAfter ? "#f59e0b" : "#f4f3f4"} />
                    </View>
                )}
            </View>
        </View>
    );
};

const NawafilCard: React.FC<{ nawafil: Nawafil }> = ({ nawafil }) => {
    const { dailyData, updateNawafilOption, updateQiyamCount } = useAppContext();
    const status: NawafilStatus = dailyData.nawafilData[nawafil.name] || {};

    return(
        <GlassCard style={styles.nawafilCard}>
            <Text style={styles.nawafilTitle}>{nawafil.emoji} {nawafil.name}</Text>
            {nawafil.isCustom ? (
                <View style={styles.qiyamContainer}>
                    <TouchableOpacity onPress={() => updateQiyamCount(nawafil.name, -2)} style={styles.qiyamButton}><Text style={styles.qiyamButtonText}>-</Text></TouchableOpacity>
                    <Text style={styles.qiyamCount}>{status.count || 0}</Text>
                    <TouchableOpacity onPress={() => updateQiyamCount(nawafil.name, 2)} style={styles.qiyamButton}><Text style={styles.qiyamButtonText}>+</Text></TouchableOpacity>
                </View>
            ) : (
                <View>
                    {nawafil.options?.map((opt, index) => (
                        <TouchableOpacity key={index} onPress={() => updateNawafilOption(nawafil.name, index)} style={[styles.dohaOption, status.selectedOption === index && styles.dohaOptionSelected]}>
                            <Text style={styles.dohaOptionText}>{opt.count} ركعات</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </GlassCard>
    )
}

const PrayersPage: React.FC = () => {
  const { prayers, nawafilPrayers } = useAppContext();
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);

  useEffect(() => {
    const loadInitialPrayer = async () => {
        const savedPrayerName = await storage.getItem('selectedPrayer');
        const savedPrayer = savedPrayerName ? prayers.find(p => p.name === savedPrayerName) : null;
        setSelectedPrayer(savedPrayer || prayers[0]);
    };
    if (prayers.length > 0) {
        loadInitialPrayer();
    }
  }, [prayers]);

  useEffect(() => {
    if (selectedPrayer) {
        storage.setItem('selectedPrayer', selectedPrayer.name);
    }
  }, [selectedPrayer]);

  if (!selectedPrayer) {
      return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            </SafeAreaView>
        );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
            <Text style={styles.header}>🕌 الصلوات</Text>
            
            <GlassCard>
                <View style={styles.selectorContainer}>
                    {prayers.map(p => (
                        <TouchableOpacity key={p.name} onPress={() => setSelectedPrayer(p)} style={[styles.selectorButton, selectedPrayer.name === p.name && styles.selectorButtonActive]}>
                            <Text style={styles.selectorEmoji}>{p.emoji}</Text>
                            <Text style={[styles.selectorLabel, selectedPrayer.name === p.name && styles.selectorLabelActive]}>{p.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <FardhPrayerDetail prayer={selectedPrayer} />
            </GlassCard>

            <GlassCard>
                 <Text style={styles.headerNawafil}>🌙 النوافل والسنن</Text>
                 <View style={styles.nawafilContainer}>
                     {nawafilPrayers.map(n => <NawafilCard key={n.name} nawafil={n} />)}
                 </View>
            </GlassCard>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#1e4d3b' },
    container: { flex: 1, padding: 16 },
    header: { fontSize: 32, fontWeight: 'bold', color: '#d4af37', textAlign: 'center', marginBottom: 20 },
    headerNawafil: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 16 },
    selectorContainer: { flexDirection: 'row-reverse', justifyContent: 'space-around', marginBottom: 20 },
    selectorButton: { padding: 8, borderRadius: 8, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', flex: 1, marginHorizontal: 2 },
    selectorButtonActive: { backgroundColor: 'rgba(255,255,255,0.25)', transform: [{ scale: 1.05 }] },
    selectorEmoji: { fontSize: 24 },
    selectorLabel: { color: '#fff', fontSize: 12, fontWeight: '600' },
    selectorLabelActive: { color: '#fde047' },
    detailContainer: { alignItems: 'center', padding: 16 },
    detailTitle: { fontSize: 36, color: '#fff', fontWeight: 'bold' },
    detailTime: { fontSize: 24, color: 'rgba(255,255,255,0.9)', marginTop: 8 },
    statusButtonsContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 20 },
    statusButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', margin: 4 },
    statusButtonText: { color: 'white', fontWeight: '600' },
    statusButtonTextActive: { color: '#064e3b' },
    statusBtnEarly: { backgroundColor: 'rgba(74, 222, 128, 0.8)', borderColor: '#6ee7b7' },
    statusBtnOnTime: { backgroundColor: 'rgba(250, 204, 21, 0.8)', borderColor: '#fde047' },
    statusBtnLate: { backgroundColor: 'rgba(251, 146, 60, 0.8)', borderColor: '#fdba74' },
    statusBtnMissed: { backgroundColor: 'rgba(239, 68, 68, 0.8)', borderColor: '#fca5a5' },
    sunnahContainer: { alignSelf: 'stretch', marginTop: 12 },
    sunnahRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8, marginBottom: 8 },
    sunnahLabel: { color: 'white', fontSize: 16 },
    nawafilContainer: { flexDirection: 'row-reverse', justifyContent: 'space-around', gap: 16 },
    nawafilCard: { flex: 1, padding: 12, alignItems: 'center' },
    nawafilTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 12 },
    qiyamContainer: { flexDirection: 'row-reverse', alignItems: 'center', gap: 16 },
    qiyamButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    qiyamButtonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    qiyamCount: { color: 'white', fontSize: 24, fontWeight: 'bold', width: 40, textAlign: 'center' },
    dohaOption: { padding: 10, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 8, width: '100%', alignItems: 'center' },
    dohaOptionSelected: { backgroundColor: 'rgba(253, 224, 71, 0.3)', borderColor: '#fde047', borderWidth: 1 },
    dohaOptionText: { color: 'white', fontWeight: 'bold' },
});

export default PrayersPage;
