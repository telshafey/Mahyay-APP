import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import GlassCard from '../../components/GlassCard';

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const AboutScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                
                <GlassCard>
                    <View style={styles.appTitleContainer}>
                        <Text style={styles.appName}>مَحيّاي</Text>
                        <Text style={styles.appSlogan}>رفيقك الروحي اليومي</Text>
                    </View>
                    
                    <Section title="رؤيتنا ورسالتنا">
                        <Text style={styles.sectionText}>نسعى لأن نكون الرفيق الروحي الأول للمسلمين، نساعدهم على الالتزام بالعبادات بطريقة منظمة ومحفزة.</Text>
                    </Section>

                    <Section title="الإلهام">
                         <Text style={styles.verseText}>"قُلْ إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ"</Text>
                         <Text style={styles.verseSource}>سورة الأنعام - آية 162</Text>
                    </Section>
                </GlassCard>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#1e4d3b' },
    container: { flex: 1, padding: 16, },
    appTitleContainer: { alignItems: 'center', marginBottom: 24, },
    appName: { fontSize: 40, fontWeight: 'bold', color: '#d4af37', },
    appSlogan: { fontSize: 18, color: 'rgba(255,255,255,0.9)', marginTop: 4, },
    section: { marginBottom: 20, },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#fde047', textAlign: 'right', marginBottom: 8, },
    sectionText: { color: '#fff', fontSize: 16, lineHeight: 24, textAlign: 'right' },
    verseText: { color: '#fff', fontSize: 20, lineHeight: 30, textAlign: 'center', fontWeight: 'bold' },
    verseSource: { color: '#fde047', fontSize: 14, textAlign: 'center', marginTop: 4 }
});

export default AboutScreen;