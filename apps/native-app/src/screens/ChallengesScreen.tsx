
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { useAppContext, CHALLENGES } from '@mahyay/core';

const ChallengesScreen: React.FC = () => {
    const { userChallenges } = useAppContext();
    const activeChallenges = userChallenges.filter(c => c.status === 'active');
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.header}>🏆 التحديات</Text>
                <FlatList
                    data={activeChallenges}
                    keyExtractor={item => item.id.toString()}
                    ListEmptyComponent={<Text style={styles.emptyText}>لا توجد تحديات نشطة.</Text>}
                    renderItem={({ item }) => {
                        const baseChallenge = CHALLENGES.find(c => c.id === item.challenge_id);
                        return (
                            <View style={styles.card}>
                                <Text style={styles.title}>{baseChallenge?.icon} {baseChallenge?.title}</Text>
                                <Text style={styles.text}>التقدم: {item.progress} / {baseChallenge?.target}</Text>
                            </View>
                        );
                    }}
                />
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
    emptyText: {
        color: 'white',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    }
});

export default ChallengesScreen;
