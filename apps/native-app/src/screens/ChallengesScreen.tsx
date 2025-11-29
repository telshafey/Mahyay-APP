import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useAppContext, DisplayChallenge } from '@mahyay/core';
import GlassCard from '../components/GlassCard';
import ChallengeCard from '../components/ChallengeCard';

const TabButton: React.FC<{ label: string; count: number; isActive: boolean; onPress: () => void; }> = ({ label, count, isActive, onPress }) => (
    <TouchableOpacity onPress={onPress} style={[styles.tabButton, isActive && styles.tabButtonActive]}>
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label} ({count})</Text>
    </TouchableOpacity>
);

const ChallengesScreen: React.FC = () => {
    const { userChallenges, startChallenge, challenges } = useAppContext();
    const [activeTab, setActiveTab] = useState<'active' | 'available' | 'completed'>('active');

    const categorizedChallenges = useMemo(() => {
        const active: DisplayChallenge[] = [];
        const completed: DisplayChallenge[] = [];
        const available: DisplayChallenge[] = [];

        for (const baseChallenge of challenges) {
            const userProgress = userChallenges.find(uc => uc.challenge_id === baseChallenge.id);
            const progress = userProgress ? userProgress.progress : 0;
            const challengeWithProgress: DisplayChallenge = { ...baseChallenge, progress, userProgress };

            if (userProgress) {
                if (userProgress.status === 'completed') {
                    completed.push(challengeWithProgress);
                } else {
                    active.push(challengeWithProgress);
                }
            } else {
                available.push(challengeWithProgress);
            }
        }
        return { active, completed, available };
    }, [userChallenges, challenges]);


    const displayedChallenges = {
        active: categorizedChallenges.active,
        available: categorizedChallenges.available,
        completed: categorizedChallenges.completed
    }[activeTab];
    
    const ListEmptyComponent = () => (
        <GlassCard>
            <Text style={styles.emptyText}>
                {activeTab === 'active' && 'لا توجد تحديات نشطة. ابدأ تحديًا جديدًا من قسم "متاحة"!'}
                {activeTab === 'available' && 'لا توجد تحديات متاحة حالياً.'}
                {activeTab === 'completed' && 'لم تكمل أي تحديات بعد. المثابرة هي مفتاح النجاح!'}
            </Text>
        </GlassCard>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.header}>🏆 التحديات الإيمانية</Text>
                
                <View style={styles.tabsContainer}>
                    <TabButton label="نشطة" count={categorizedChallenges.active.length} isActive={activeTab === 'active'} onPress={() => setActiveTab('active')} />
                    <TabButton label="متاحة" count={categorizedChallenges.available.length} isActive={activeTab === 'available'} onPress={() => setActiveTab('available')} />
                    <TabButton label="مكتملة" count={categorizedChallenges.completed.length} isActive={activeTab === 'completed'} onPress={() => setActiveTab('completed')} />
                </View>

                <FlatList
                    data={displayedChallenges}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={ListEmptyComponent}
                    renderItem={({ item }) => <ChallengeCard challenge={item} onStartChallenge={startChallenge} />}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#1e4d3b' },
    container: { flex: 1, },
    header: { fontSize: 32, fontWeight: 'bold', color: '#d4af37', textAlign: 'center', marginVertical: 20, paddingHorizontal: 16 },
    tabsContainer: { 
        flexDirection: 'row-reverse', 
        justifyContent: 'space-around', 
        backgroundColor: 'rgba(0,0,0,0.2)', 
        borderRadius: 12, 
        padding: 4, 
        marginBottom: 16,
        marginHorizontal: 16,
    },
    tabButton: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
    tabButtonActive: { backgroundColor: 'rgba(253, 224, 71, 0.3)' },
    tabLabel: { color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
    tabLabelActive: { color: '#fde047', },
    emptyText: { color: 'white', textAlign: 'center', padding: 20, fontSize: 16, lineHeight: 24 },
});

export default ChallengesScreen;