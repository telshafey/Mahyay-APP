
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useAppContext, QURAN_SURAHS } from '@mahyay/core';

const QuranScreen: React.FC = () => {
    const { dailyData, settings } = useAppContext();
    const currentSurahName = QURAN_SURAHS.find(s => s.id === settings.khatmaPosition.surah)?.name || '...';
    
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.header}>📖 القرآن الكريم</Text>
                <View style={styles.card}>
                    <Text style={styles.title}>آخر موضع وصلت إليه</Text>
                    <Text style={styles.positionText}>سورة {currentSurahName} - آية {settings.khatmaPosition.ayah}</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.title}>التقدم اليومي</Text>
                    <Text style={styles.progressText}>{dailyData.quranPagesRead || 0} / {settings.quranGoal} صفحات</Text>
                </View>
            </View>
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
        justifyContent: 'center',
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#d4af37',
        textAlign: 'center',
        marginBottom: 30,
    },
    card: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        alignItems: 'center',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    positionText: {
        color: '#d4af37',
        fontSize: 24,
        fontWeight: 'bold',
    },
    progressText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '600',
    }
});

export default QuranScreen;
