import React, { useState, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, UIManager, Platform } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionProps {
    title: ReactNode;
    children: ReactNode;
    startOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, startOpen = false }) => {
    const [isOpen, setIsOpen] = useState(startOpen);

    const toggleOpen = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOpen(!isOpen);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={toggleOpen} style={styles.titleContainer}>
                <View style={styles.titleContent}>
                    {typeof title === 'string' ? <Text style={styles.titleText}>{title}</Text> : title}
                </View>
                <Text style={styles.arrow}>{isOpen ? '▼' : '◀'}</Text>
            </TouchableOpacity>
            {isOpen && (
                <View style={styles.content}>
                    {children}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 8,
    },
    titleContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        padding: 16,
    },
    titleContent: {
        flex: 1,
        marginLeft: 10,
    },
    titleText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'right',
    },
    arrow: {
        color: 'white',
        fontSize: 14,
    },
    content: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
});

export default Accordion;