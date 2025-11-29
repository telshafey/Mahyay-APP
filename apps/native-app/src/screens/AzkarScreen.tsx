import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useAppContext, Zikr, DailyAzkarCategory, AzkarCategory } from '@mahyay/core';
import GlassCard from '../components/GlassCard';
import Accordion from '../components/Accordion';

const ZikrItemCard: React.FC<{
    zikr: Zikr;
    categoryName: DailyAzkarCategory | string;
}> = ({ zikr, categoryName }) => {
    const { dailyData, incrementAzkarCount, completeZikr } = useAppContext();
    
    const currentCount = dailyData.azkarStatus[categoryName as DailyAzkarCategory]?.[zikr.id] || 0;
    const isDone = currentCount >= zikr.repeat;

    const handlePress = () => {
        if (!isDone) {
            if (zikr.repeat > 1) {
                incrementAzkarCount(categoryName as DailyAzkarCategory, zikr.id);
            } else {
                completeZikr(categoryName as DailyAzkarCategory, zikr.id);
            }
        }
    };
    
    const progressPercentage = (currentCount / zikr.repeat) * 100;

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={[styles.zikrCard, isDone && styles.zikrCardDone]}>
            <View style={[styles.progressIndicator, { width: `${progressPercentage}%` }]} />
            <Text style={styles.zikrText}>{zikr.text}</Text>
            {zikr.notes && <Text style={styles.zikrNotes}>({zikr.notes})</Text>}
            <Text style={styles.zikrReference}>{zikr.reference}</Text>
            <View style={styles.counterContainer}>
                <Text style={styles.counterText}>{currentCount} / {zikr.repeat}</Text>
            </View>
        </TouchableOpacity>
    );
};


const TabButton: React.FC<{ label: string; icon: string; isActive: boolean; onPress: () => void; }> = ({ label, icon, isActive, onPress }) => (
    <TouchableOpacity onPress={onPress} style={[styles.tabButton, isActive && styles.tabButtonActive]}>
        <Text style={styles.tabIcon}>{icon}</Text>
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
);

const AzkarScreen: React.FC = () => {
    const { dailyData, settings, azkarData } = useAppContext();
    const [activeTab, setActiveTab] = useState<AzkarCategory['name']>('أذكار الصباح');

    useEffect(() => {
        const now = new Date();
        const [morningH, morningM] = settings.azkarMorningStart.split(':').map(Number);
        const [eveningH, eveningM] = settings.azkarEveningStart.split(':').map(Number);
        const morningDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), morningH, morningM);
        const eveningDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), eveningH, eveningM);

        if (now >= morningDate && now < eveningDate) {
            setActiveTab('أذكار الصباح');
        } else {
            setActiveTab('أذكار المساء');
        }
    }, [settings.azkarMorningStart, settings.azkarEveningStart]);
    
    const dailyCategories = useMemo(() => [
        { name: 'أذكار الصباح', icon: '🌅' },
        { name: 'أذكار المساء', icon: '🌃' },
        { name: 'أذكار النوم', icon: '😴' },
        { name: 'أذكار الاستيقاظ', icon: '🌤️' }
    ], []);
    
    const generalCategories = useMemo(() => azkarData.filter(c => !dailyCategories.some(dc => dc.name === c.name)), [azkarData, dailyCategories]);

    const isCategoryComplete = (category: AzkarCategory) => {
        const categoryProgress = dailyData.azkarStatus[category.name as DailyAzkarCategory];
        if (!categoryProgress) return false;
        return category.items.every(item => (categoryProgress[item.id] || 0) >= item.repeat);
    };

    const renderAzkarList = (category: AzkarCategory) => {
        if (isCategoryComplete(category)) {
            return (
                <GlassCard style={styles.completedCard}>
                     <Text style={styles.completedEmoji}>🎉</Text>
                    <Text style={styles.completedText}>ما شاء الله! لقد أتممت {category.name}.</Text>
                </GlassCard>
            );
        }
        return (
            <View>
                {category.items.map(zikr => (
                    <ZikrItemCard key={zikr.id} zikr={zikr} categoryName={category.name} />
                ))}
            </View>
        );
    };

    const currentDailyCategory = azkarData.find(c => c.name === activeTab);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <Text style={styles.header}>📿 الأذكار</Text>
                <View style={styles.tabsContainer}>
                    {dailyCategories.map(cat => <TabButton key={cat.name} label={cat.name.replace('أذكار ', '')} icon={cat.icon} isActive={activeTab === cat.name} onPress={() => setActiveTab(cat.name)} />)}
                    <TabButton label="عامة" icon="🤲" isActive={activeTab === 'عامة'} onPress={() => setActiveTab('عامة')} />
                </View>
                
                {currentDailyCategory && dailyCategories.some(dc => dc.name === activeTab) && renderAzkarList(currentDailyCategory)}
                
                {activeTab === 'عامة' && (
                    <View>
                        {generalCategories.map(category => (
                             <Accordion key={category.name} title={<Text style={{color: 'white', fontWeight: 'bold'}}>{category.name}</Text>}>
                                {category.items.map(zikr => (
                                     <View key={zikr.id} style={styles.generalZikrItem}>
                                        <Text style={styles.zikrText}>{zikr.text}</Text>
                                        <Text style={styles.zikrReference}>{zikr.reference}</Text>
                                     </View>
                                ))}
                            </Accordion>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#1e4d3b' },
    container: { flex: 1, paddingHorizontal: 16 },
    header: { fontSize: 32, fontWeight: 'bold', color: '#d4af37', textAlign: 'center', marginVertical: 20 },
    tabsContainer: { flexDirection: 'row-reverse', justifyContent: 'space-around', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 4, marginBottom: 16 },
    tabButton: { flex: 1, padding: 8, borderRadius: 8, alignItems: 'center' },
    tabButtonActive: { backgroundColor: 'rgba(253, 224, 71, 0.3)' },
    tabIcon: { fontSize: 18 },
    tabLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
    tabLabelActive: { color: '#fde047', fontWeight: 'bold' },
    zikrCard: { padding: 16, marginBottom: 10, overflow: 'hidden' },
    zikrCardDone: { backgroundColor: 'rgba(74, 222, 128, 0.2)' },
    progressIndicator: { position: 'absolute', top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(74, 222, 128, 0.3)' },
    zikrText: { color: '#fff', fontSize: 18, lineHeight: 28, marginBottom: 12, textAlign: 'right' },
    zikrNotes: { color: '#fde047', fontSize: 14, marginBottom: 8, textAlign: 'right' },
    zikrReference: { color: 'rgba(255,255,255,0.8)', fontSize: 12, textAlign: 'right', borderRightWidth: 2, borderRightColor: 'rgba(253, 224, 71, 0.5)', paddingRight: 8 },
    counterContainer: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 12 },
    counterText: { color: '#fff', fontWeight: 'bold' },
    completedCard: { alignItems: 'center', padding: 30, backgroundColor: 'rgba(74, 222, 128, 0.2)' },
    completedEmoji: { fontSize: 50, marginBottom: 12 },
    completedText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    generalZikrItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' }
});

export default AzkarScreen;