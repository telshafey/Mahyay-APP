
import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useAppContext, usePrayerTimesContext } from '@mahyay/core';

const HomeScreen: React.FC = () => {
    const { dailyData, stats } = useAppContext();
    const { nextPrayer, isPrayerTimesLoading } = usePrayerTimesContext();
    
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <Text style={styles.header}>مَحيّاي</Text>
                
                <View style={styles.card}>
                    <Text style={styles.title}>🗓️ خلاصة اليوم</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.totalPoints}</Text>
                            <Text style={styles.statLabel}>🌟 نقاط</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.streak}</Text>
                            <Text style={styles.statLabel}>🔥 أيام متتالية</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{dailyData.quranPagesRead || 0}</Text>
                            <Text style={styles.statLabel}>📖 صفحات قرآن</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.title}>🕌 الصلوات</Text>
                    {isPrayerTimesLoading ? (
                        <Text style={styles.text}>جاري تحميل مواقيت الصلاة...</Text>
                    ) : (
                        <View style={styles.centerText}>
                            <Text style={styles.text}>الصلاة القادمة: {nextPrayer.prayer?.name || '...'}</Text>
                            <Text style={styles.countdown}>{nextPrayer.countdown}</Text>
                        </View>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#1e4d3b',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#d4af37',
        textAlign: 'center',
        marginBottom: 20,
    },
    card: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'right',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 12,
        color: '#fff',
        marginTop: 4,
    },
    text: {
        color: '#fff',
        fontSize: 16,
    },
    centerText: {
        alignItems: 'center',
    },
    countdown: {
        color: '#d4af37',
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 8,
    },
});

export default HomeScreen;
