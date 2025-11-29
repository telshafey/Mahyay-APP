
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useAppContext, PRAYERS } from '@mahyay/core';

const PrayersScreen: React.FC = () => {
    const { dailyData } = useAppContext();
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <Text style={styles.header}>🕌 الصلوات</Text>
                {PRAYERS.map(prayer => (
                    <View key={prayer.name} style={styles.card}>
                        <Text style={styles.title}>{prayer.emoji} {prayer.name}</Text>
                        <Text style={styles.text}>الحالة: {dailyData.prayerData[prayer.name]?.fard || 'لم تصل'}</Text>
                    </View>
                ))}
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
        marginBottom: 8,
        textAlign: 'right'
    },
    text: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'right'
    },
});

export default PrayersScreen;
