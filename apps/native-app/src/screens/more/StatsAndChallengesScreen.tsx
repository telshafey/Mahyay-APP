import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useAppContext } from '@mahyay/core';
import GlassCard from '../../components/GlassCard';

const StatCard: React.FC<{ icon: string; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
    <GlassCard style={{ backgroundColor: color, flex: 1, margin: 4 }}>
        <View style={styles.statCard}>
            <Text style={styles.statIcon}>{icon}</Text>
            <View style={styles.statContent}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </View>
    </GlassCard>
);

const StatsAndChallengesScreen: React.FC = () => {
    const { stats } = useAppContext();
    const { percentage } = stats.khatmaProgress;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                
                <View style={styles.grid}>
                    <StatCard label="نقاط الإنجاز" value={stats.totalPoints} icon="🌟" color="rgba(252, 211, 77, 0.2)" />
                    <StatCard label="أيام متتالية" value={stats.streak} icon="🔥" color="rgba(251, 146, 60, 0.2)" />
                </View>
                <View style={styles.grid}>
                    <StatCard label="صلوات الشهر" value={stats.monthlyPrayers} icon="🗓️" color="rgba(45, 212, 191, 0.2)" />
                    <StatCard label="أذكار مكتملة" value={stats.completedAzkar} icon="📿" color="rgba(167, 139, 250, 0.2)" />
                </View>
                
                <GlassCard>
                    <Text style={styles.title}>📖 تقدم الختمة</Text>
                    <View style={styles.progressContainer}>
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
    container: { flex: 1, padding: 12, },
    grid: { flexDirection: 'row-reverse', justifyContent: 'space-between', },
    statCard: { flexDirection: 'row-reverse', alignItems: 'center', },
    statIcon: { fontSize: 28, padding: 8, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12 },
    statContent: { marginRight: 12 },
    statValue: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'right' },
    statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'right' },
    title: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 12, textAlign: 'center' },
    progressContainer: { alignItems: 'center' },
    progressText: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
    progressBarBackground: { height: 10, width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 5, overflow: 'hidden' },
    progressBarForeground: { height: 10, backgroundColor: '#38bdf8', borderRadius: 5, },
});

export default StatsAndChallengesScreen;