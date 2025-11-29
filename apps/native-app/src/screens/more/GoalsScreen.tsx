import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useAppContext, PersonalGoal, GoalType } from '@mahyay/core';
import GlassCard from '../../components/GlassCard';

const GOAL_ICONS = ['🎯', '📖', '🤲', '❤️', '💰', '🏃‍♂️', '🌱', '⭐', '📿', '🕌'];

const GoalsScreen: React.FC = () => {
    const { personalGoals, addPersonalGoal, dailyData, toggleDailyGoalCompletion } = useAppContext();
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [goal, setGoal] = useState({ title: '', icon: GOAL_ICONS[0], type: 'daily' as GoalType });
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

    const handleFormSubmit = async () => {
        if (!goal.title.trim()) return;
        const newGoal: Omit<PersonalGoal, 'id' | 'user_id' | 'created_at' | 'is_archived' | 'completed_at'> = {
            title: goal.title, 
            icon: goal.icon, 
            type: goal.type,
            target: 1, // Simplified for native
        };
        const success = await addPersonalGoal(newGoal);
        if(success) {
            setGoal({ title: '', icon: GOAL_ICONS[0], type: 'daily' });
            setIsFormVisible(false);
        }
    };

    const activeGoals = personalGoals.filter(g => !g.is_archived && g.type === 'daily'); // only daily goals are interactive for now
    const completedGoals = personalGoals.filter(g => g.is_archived);
    
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                {!isFormVisible && (
                    <TouchableOpacity style={styles.addButton} onPress={() => setIsFormVisible(true)}>
                        <Text style={styles.addButtonText}>+ إضافة هدف جديد</Text>
                    </TouchableOpacity>
                )}

                {isFormVisible && (
                    <GlassCard>
                        <Text style={styles.formTitle}>هدف جديد</Text>
                        <TextInput style={styles.input} placeholder="عنوان الهدف" placeholderTextColor="gray" value={goal.title} onChangeText={t => setGoal({...goal, title: t})} />
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleFormSubmit}><Text style={styles.saveButtonText}>حفظ</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsFormVisible(false)}><Text style={styles.cancelButtonText}>إلغاء</Text></TouchableOpacity>
                        </View>
                    </GlassCard>
                )}
                
                <Text style={styles.listTitle}>أهداف يومية</Text>
                {activeGoals.map(g => {
                    const isCompletedToday = dailyData.dailyGoalProgress[g.id];
                    return (
                        <GlassCard key={g.id}>
                            <View style={styles.goalItem}>
                                <Text style={styles.goalIcon}>{g.icon}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.goalTitle}>{g.title}</Text>
                                </View>
                                <Switch
                                    trackColor={{ false: "#767577", true: "#fde047" }}
                                    thumbColor={isCompletedToday ? "#f59e0b" : "#f4f3f4"}
                                    onValueChange={() => toggleDailyGoalCompletion(g.id)}
                                    value={isCompletedToday}
                                />
                            </View>
                        </GlassCard>
                    );
                })}

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#1e4d3b' },
    container: { flex: 1, padding: 16 },
    addButton: { backgroundColor: '#fde047', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
    addButtonText: { color: '#065f46', fontSize: 18, fontWeight: 'bold' },
    formTitle: { fontSize: 20, color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
    input: { backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', padding: 12, borderRadius: 8, textAlign: 'right', marginBottom: 16 },
    buttonContainer: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
    saveButton: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, flex: 1, marginRight: 8, alignItems: 'center' },
    saveButtonText: { color: 'white', fontWeight: 'bold' },
    cancelButton: { backgroundColor: '#6b7280', padding: 12, borderRadius: 8, flex: 1, alignItems: 'center' },
    cancelButtonText: { color: 'white', fontWeight: 'bold' },
    listTitle: { color: '#fde047', fontSize: 22, fontWeight: 'bold', textAlign: 'right', marginBottom: 12 },
    goalItem: { flexDirection: 'row-reverse', alignItems: 'center' },
    goalIcon: { fontSize: 36, marginRight: 16 },
    goalTitle: { fontSize: 18, color: 'white', fontWeight: 'bold', textAlign: 'right' },
    goalType: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
});

export default GoalsScreen;