
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useAppContext, AZKAR_DATA, DailyAzkarCategory } from '@mahyay/core';

const AzkarScreen: React.FC = () => {
    const { dailyData } = useAppContext();

    const morningCategory = AZKAR_DATA.find(c => c.name === 'أذكار الصباح');
    const eveningCategory = AZKAR_DATA.find(c => c.name === 'أذكار المساء');
    const postPrayerCategory = AZKAR_DATA.find(c => c.name === 'أذكار ما بعد الصلاة');
    
    const isCategoryComplete = (categoryName: DailyAzkarCategory) => {
        const category = AZKAR_DATA.find(c => c.name === categoryName);
        if (!category) return false;

        const categoryProgress = dailyData.azkarStatus[categoryName];
        if (!categoryProgress) return false;

        return category.items.every(item => (categoryProgress[item.id] || 0) >= item.repeat);
    };

    const morningAzkarDone = isCategoryComplete('أذكار الصباح');
    const eveningAzkarDone = isCategoryComplete('أذكار المساء');
    const postPrayerAzkarDone = isCategoryComplete('أذكار ما بعد الصلاة');

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <Text style={styles.header}>📿 الأذكار</Text>
                <View style={styles.card}>
                    <Text style={styles.title}>{morningCategory?.items.length ? '🌅 أذكار الصباح' : ''}</Text>
                    <Text style={styles.text}>{morningAzkarDone ? '✅ مكتمل' : 'غير مكتمل'}</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.title}>{eveningCategory?.items.length ? '🌃 أذكار المساء' : ''}</Text>
                    <Text style={styles.text}>{eveningAzkarDone ? '✅ مكتمل' : 'غير مكتمل'}</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.title}>{postPrayerCategory?.items.length ? '🕌 أذكار ما بعد الصلاة' : ''}</Text>
                    <Text style={styles.text}>{postPrayerAzkarDone ? '✅ مكتمل' : 'غير مكتمل'}</Text>
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
        marginBottom: 8,
        textAlign: 'right'
    },
    text: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'right'
    },
});

export default AzkarScreen;