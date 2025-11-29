import React from 'react';
import { TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useAppContext } from '@mahyay/core';
import { Text } from 'react-native'; // Import Text component from react-native

const MoreListItem: React.FC<{ onPress: () => void; icon: string; title: string; }> = ({ onPress, icon, title }) => (
    <TouchableOpacity onPress={onPress} style={styles.listItem}>
        <Text style={styles.listItemText}>{title}</Text>
        <Text style={styles.listItemIcon}>{icon}</Text>
    </TouchableOpacity>
);

const MoreScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { featureToggles } = useAppContext();

    const menuItems = [
        { screen: 'Stats', icon: '📊', title: 'الإحصائيات والتحديات' },
        { screen: 'Goals', icon: '🎯', title: 'أهدافي الشخصية' },
        { screen: 'Settings', icon: '⚙️', title: 'الإعدادات' },
        { screen: 'Support', icon: '🆘', title: 'الدعم والأسئلة الشائعة' },
        { screen: 'About', icon: 'ℹ️', title: 'عن التطبيق' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <Text style={styles.header}>المزيد</Text>
                {menuItems.map(item => (
                    <MoreListItem 
                        key={item.screen} 
                        onPress={() => navigation.navigate(item.screen)}
                        icon={item.icon}
                        title={item.title} 
                    />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#1e4d3b' },
    container: { flex: 1, },
    header: { fontSize: 32, fontWeight: 'bold', color: '#d4af37', textAlign: 'center', marginVertical: 20 },
    listItem: { 
        backgroundColor: 'rgba(0,0,0,0.2)', 
        padding: 20, 
        borderRadius: 12, 
        marginHorizontal: 16,
        marginBottom: 12, 
        flexDirection: 'row-reverse', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
    },
    listItemText: { color: '#fff', fontSize: 18, fontWeight: '600' },
    listItemIcon: { color: '#fff', fontSize: 24 },
});

export default MoreScreen;