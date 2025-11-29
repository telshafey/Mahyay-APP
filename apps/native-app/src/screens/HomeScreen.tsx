import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useAppContext, usePrayerTimesContext, PrayerStatus, PRAYERS } from '@mahyay/core';
import GlassCard from '../components/GlassCard';

const VerseCard: React.FC = () => {
    const verse = "قُلْ إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ";
    const source = "سورة الأنعام - آية 162";
    
    return (
        <GlassCard style={styles.verseCard}>
            <Text style={styles.verseText}>"{verse}"</Text>
            <Text style={styles.verseSource}>{source}</Text>
        </GlassCard>
    );
}

const StatItem: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
    <View style={styles.statItem}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const PrayerProgressItem: React.FC<{ name: string; emoji: string; status: string }> = React.memo(({ name, emoji, status }) => {
    const statusStyles: { [key: string]: any } = {
        early: { backgroundColor: 'rgba(74, 222, 128, 0.3)', color: '#a7f3d0' },
        ontime: { backgroundColor: 'rgba(250, 204, 21, 0.3)', color: '#fef08a' },
        late: { backgroundColor: 'rgba(251, 146, 60, 0.3)', color: '#fed7aa' },
        missed: { backgroundColor: 'rgba(239, 68, 68, 0.3)', color: '#fecaca' },
        not_prayed: { backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.7)' }
    };
    const style = statusStyles[status] || statusStyles['not_prayed'];
    return (
        <View style={[styles.prayerItem, { backgroundColor: style.backgroundColor }]}>
            <Text style={styles.prayerEmoji}>{emoji}</Text>
            <Text style={[styles.prayerName, {color: style.color}]}>{name}</Text>
        </View>
    );
});


const HomeScreen: React.FC = () => {
    const { dailyData, stats } = useAppContext();
    const { nextPrayer, isPrayerTimesLoading } = usePrayerTimesContext();
    
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.header}>مَحيّاي</Text>
                
                <VerseCard />

                <GlassCard>
                    <Text style={styles.title}>🗓️ خلاصة اليوم</Text>
                    <View style={styles.statsGrid}>
                        <StatItem label="🌟 نقاط" value={stats.totalPoints} />
                        <StatItem label="🔥 أيام متتالية" value={stats.streak} />
                        <StatItem label="📖 صفحات قرآن" value={dailyData.quranPagesRead || 0} />
                        <StatItem label="🕌 صلوات" value={`${Object.values(dailyData.prayerData).filter((p: PrayerStatus) => ['early', 'ontime'].includes(p.fard)).length}/5`} />
                    </View>
                </GlassCard>

                <GlassCard>
                    <Text style={styles.title}>🕌 الصلوات</Text>
                    {isPrayerTimesLoading ? (
                        <Text style={styles.text}>جاري تحميل مواقيت الصلاة...</Text>
                    ) : (
                        <View style={styles.centerText}>
                            <Text style={styles.text}>الصلاة القادمة: {nextPrayer.prayer?.name || '...'}</Text>
                            <Text style={styles.countdown}>{nextPrayer.countdown}</Text>
                        </View>
                    )}
                    <View style={styles.prayerGrid}>
                        {PRAYERS.map(p => (
                            <PrayerProgressItem 
                                key={p.name} 
                                name={p.name} 
                                emoji={p.emoji} 
                                status={dailyData.prayerData[p.name]?.fard || 'not_prayed'} 
                            />
                        ))}
                    </View>
                </GlassCard>
                
                 <View style={styles.cardGrid}>
                    <GlassCard style={styles.gridCard}>
                        <Text style={styles.title}>📿 الأذكار</Text>
                        {/* Simplified view for home page */}
                        <Text style={styles.cardText}>... جاري التطوير</Text>
                    </GlassCard>
                    <GlassCard style={styles.gridCard}>
                        <Text style={styles.title}>📖 القرآن</Text>
                        <View style={styles.centerText}>
                           <Text style={styles.quranPages}>{dailyData.quranPagesRead || 0}</Text>
                           <Text style={styles.text}>صفحة</Text>
                        </View>
                    </GlassCard>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#1e4d3b', },
    container: { flex: 1, },
    contentContainer: { padding: 16, },
    header: { fontSize: 32, fontWeight: 'bold', color: '#d4af37', textAlign: 'center', marginBottom: 20, fontFamily: 'Amiri-Bold' },
    title: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 12, textAlign: 'right', },
    statsGrid: { flexDirection: 'row-reverse', justifyContent: 'space-around', },
    statItem: { alignItems: 'center', flex: 1, },
    statValue: { fontSize: 22, fontWeight: 'bold', color: '#fff', },
    statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4, },
    text: { color: '#fff', fontSize: 16, textAlign: 'center', },
    centerText: { alignItems: 'center', },
    countdown: { color: '#d4af37', fontSize: 28, fontWeight: 'bold', marginTop: 8, },
    verseCard: { backgroundColor: 'rgba(212, 175, 55, 0.2)', borderColor: 'rgba(212, 175, 55, 0.3)', },
    verseText: { fontSize: 24, lineHeight: 36, color: '#fff', fontWeight: 'bold', textAlign: 'center', marginBottom: 8, fontFamily: 'Amiri-Bold' },
    verseSource: { color: '#d4af37', fontWeight: '600', textAlign: 'center', },
    prayerGrid: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 16 },
    prayerItem: { flex: 1, alignItems: 'center', gap: 4, padding: 8, borderRadius: 8, marginHorizontal: 2, },
    prayerEmoji: { fontSize: 20, },
    prayerName: { fontSize: 10, fontWeight: 'bold', },
    cardGrid: { flexDirection: 'row-reverse', justifyContent: 'space-between', gap: 16 },
    gridCard: { flex: 1 },
    cardText: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', paddingTop: 10 },
    quranPages: { color: '#fde047', fontSize: 36, fontWeight: 'bold' }
});

export default HomeScreen;