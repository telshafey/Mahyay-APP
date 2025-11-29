import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DisplayChallenge, useAppContext } from '@mahyay/core';
import GlassCard from './GlassCard';

interface ChallengeCardProps {
    challenge: DisplayChallenge;
    onStartChallenge: (challengeId: string) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onStartChallenge }) => {
    const { logManualChallengeProgress } = useAppContext();
    const progressPercentage = challenge.target > 0 ? (challenge.progress / challenge.target) * 100 : 0;
    const isCompleted = challenge.userProgress?.status === 'completed';
    const isActive = challenge.userProgress?.status === 'active';

    return (
        <GlassCard style={[styles.card, isCompleted && styles.completedCard]}>
            <View style={styles.header}>
                <Text style={styles.icon}>{challenge.icon}</Text>
                <View style={styles.headerText}>
                    <Text style={styles.title}>{challenge.title}</Text>
                    <Text style={styles.description}>{challenge.description}</Text>
                    <Text style={styles.points}>+{challenge.points} نقطة | {challenge.durationDays} أيام</Text>
                </View>
            </View>
            
            {!isActive && !isCompleted && (
                <TouchableOpacity onPress={() => onStartChallenge(challenge.id)} style={styles.startButton}>
                    <Text style={styles.startButtonText}>ابدأ التحدي</Text>
                </TouchableOpacity>
            )}

            {isActive && challenge.tracking === 'auto' && (
                <View style={styles.progressContainer}>
                    <View style={styles.progressRow}>
                        <Text style={styles.progressLabel}>التقدم</Text>
                        <Text style={styles.progressValue}>{Math.min(challenge.progress, challenge.target)} / {challenge.target}</Text>
                    </View>
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarForeground, { width: `${Math.min(progressPercentage, 100)}%` }]} />
                    </View>
                </View>
            )}

            {isActive && challenge.tracking === 'manual' && (
                <TouchableOpacity onPress={() => logManualChallengeProgress(challenge.id)} style={styles.logButton}>
                    <Text style={styles.logButtonText}>تسجيل الإنجاز ({challenge.progress}/{challenge.target})</Text>
                </TouchableOpacity>
            )}

            {isCompleted && <Text style={styles.completedText}>🎉 مكتمل!</Text>}
        </GlassCard>
    );
};

const styles = StyleSheet.create({
    card: { padding: 16, marginBottom: 12 },
    completedCard: { backgroundColor: 'rgba(74, 222, 128, 0.2)', borderColor: 'rgba(74, 222, 128, 0.3)' },
    header: { flexDirection: 'row-reverse', alignItems: 'flex-start' },
    icon: { fontSize: 32, backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 8, marginLeft: 12 },
    headerText: { flex: 1 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'right' },
    description: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'right', lineHeight: 18 },
    points: { color: '#fde047', fontSize: 12, fontWeight: 'bold', marginTop: 8, textAlign: 'right' },
    startButton: { backgroundColor: '#fde047', paddingVertical: 10, borderRadius: 20, alignItems: 'center', marginTop: 16 },
    startButtonText: { color: '#065f46', fontWeight: 'bold', fontSize: 14 },
    logButton: { backgroundColor: '#2dd4bf', paddingVertical: 10, borderRadius: 20, alignItems: 'center', marginTop: 16 },
    logButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    progressContainer: { marginTop: 16 },
    progressRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 4 },
    progressLabel: { color: '#fff', fontSize: 12 },
    progressValue: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    progressBarBackground: { height: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 4 },
    progressBarForeground: { height: 8, backgroundColor: '#2dd4bf', borderRadius: 4 },
    completedText: { color: '#6ee7b7', fontWeight: 'bold', textAlign: 'center', marginTop: 12, fontSize: 16 },
});

export default React.memo(ChallengeCard);