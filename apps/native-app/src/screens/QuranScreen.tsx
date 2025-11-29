import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useAppContext } from '@mahyay/core';
import GlassCard from '../components/GlassCard';

const QuranScreen: React.FC = () => {
    const { settings, dailyData, quranSurahs, stats } = useAppContext();
    const currentPosition = settings.khatmaPosition;
    const currentSurahName = quranSurahs.find(s => s.id === currentPosition.surah)?.name || '...';
    const { percentage } = stats.khatmaProgress;
    
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <Text style={styles.header}>📖 القرآن الكريم</Text>

                <GlassCard style={styles.card}>
                    <Text style={styles.title}>آخر موضع وصلت إليه</Text>
                    <Text style={styles.positionText}>سورة {currentSurahName} - آية {currentPosition.ayah}</Text>
                </GlassCard>
                
                 <GlassCard style={styles.card}>
                    <Text style={styles.title}>تقدم الختمة الحالية</Text>
                    <View style={{ alignItems: 'center' }}>
                         <Text style={styles.progressText}>{Math.round(percentage)}%</Text>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBarForeground, { width: `${percentage}%` }]} />
                        </View>
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
    card: { padding: 20, marginBottom: 20 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15, textAlign: 'center' },
    positionText: { color: '#d4af37', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
    progressText: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
    progressBarBackground: { height: 10, width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 5, overflow: 'hidden' },
    progressBarForeground: { height: 10, backgroundColor: '#38bdf8', borderRadius: 5 },
});

export default QuranScreen;