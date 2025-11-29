import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Image, Alert } from 'react-native';
import { useAppContext, useAuthContext } from '@mahyay/core';
import GlassCard from '../../components/GlassCard';

const SettingsScreen: React.FC = () => {
    const { settings, updateSettings, resetAllData } = useAppContext();
    const { profile, signOut } = useAuthContext();
    const [notifications, setNotifications] = useState(settings.notifications);

    const handleToggle = (key: 'prayers' | 'azkar') => {
        const newNotifs = { ...notifications, [key]: !notifications[key] };
        setNotifications(newNotifs);
        updateSettings({ notifications: newNotifs });
    };
    
    const handleSignOut = () => {
        if(signOut) {
            signOut();
        }
    };
    
    const handleReset = () => {
        Alert.alert(
            "إعادة تعيين التطبيق",
            "⚠️ تحذير! هل أنت متأكد من حذف جميع بياناتك؟ لا يمكن التراجع عن هذا الإجراء.",
            [
                { text: "إلغاء", style: "cancel" },
                { text: "نعم، حذف الكل", style: "destructive", onPress: resetAllData }
            ]
        );
    }


    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                
                <GlassCard>
                    <View style={styles.profileSection}>
                        {profile?.picture && <Image source={{ uri: profile?.picture }} style={styles.avatar} />}
                        <Text style={styles.profileName}>{profile?.name}</Text>
                        <Text style={styles.profileEmail}>{profile?.email}</Text>
                    </View>
                </GlassCard>
                
                <GlassCard>
                    <Text style={styles.sectionTitle}>الإشعارات الداخلية</Text>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>إشعارات الصلوات</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#fde047" }}
                            thumbColor={notifications.prayers ? "#f59e0b" : "#f4f3f4"}
                            onValueChange={() => handleToggle('prayers')}
                            value={notifications.prayers}
                        />
                    </View>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>إشعارات الأذكار</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#fde047" }}
                            thumbColor={notifications.azkar ? "#f59e0b" : "#f4f3f4"}
                            onValueChange={() => handleToggle('azkar')}
                            value={notifications.azkar}
                        />
                    </View>
                </GlassCard>

                <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                    <Text style={styles.logoutButtonText}>تسجيل الخروج</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                    <Text style={styles.resetButtonText}>🗑️ إعادة تعيين التطبيق</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#1e4d3b' },
    container: { flex: 1, padding: 16 },
    profileSection: { alignItems: 'center', padding: 16 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', marginBottom: 12 },
    profileName: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    profileEmail: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16, textAlign: 'right' },
    settingRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    settingLabel: { color: '#fff', fontSize: 16 },
    logoutButton: { backgroundColor: '#fde047', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    logoutButtonText: { color: '#065f46', fontSize: 18, fontWeight: 'bold' },
    resetButton: { backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.5)' },
    resetButtonText: { color: '#fca5a5', fontSize: 16, fontWeight: 'bold' }
});

export default SettingsScreen;