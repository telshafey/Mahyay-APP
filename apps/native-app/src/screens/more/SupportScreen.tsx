import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useAppContext, FAQ } from '@mahyay/core';
import Accordion from '../../components/Accordion';

const FAQItem: React.FC<{ faq: FAQ }> = ({ faq }) => (
    <Accordion title={<Text style={styles.questionText}>{faq.q}</Text>}>
        <Text style={styles.answerText}>{faq.a}</Text>
    </Accordion>
);

const SupportScreen: React.FC = () => {
    const { faqs } = useAppContext();

    const handleContactPress = () => {
        Linking.openURL('mailto:support@tech-bokra.com');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                
                <View style={styles.faqContainer}>
                    {faqs.map(faq => <FAQItem key={faq.id} faq={faq} />)}
                </View>

                <View style={styles.contactContainer}>
                    <Text style={styles.contactTitle}>تحتاج مساعدة إضافية؟</Text>
                    <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
                        <Text style={styles.contactButtonText}>📧 تواصل مع الدعم</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#1e4d3b' },
    container: { flex: 1, padding: 16, },
    faqContainer: { marginBottom: 24, },
    questionText: { color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'right' },
    answerText: { color: 'rgba(255,255,255,0.9)', fontSize: 16, padding: 16, lineHeight: 24, textAlign: 'right' },
    contactContainer: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 20, alignItems: 'center' },
    contactTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    contactButton: { backgroundColor: '#fde047', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
    contactButtonText: { color: '#065f46', fontSize: 16, fontWeight: 'bold' },
});

export default SupportScreen;