
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuthContext, AppContext, useAppData, PrayerTimesContext, usePrayerTimes, useAppContext } from '@mahyay/core';
import { Text, View, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import PrayersScreen from './src/screens/PrayersScreen';
import AzkarScreen from './src/screens/AzkarScreen';
import QuranScreen from './src/screens/QuranScreen';
import ChallengesScreen from './src/screens/ChallengesScreen';

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1e4d3b',
    },
    loadingText: {
        marginTop: 10,
        color: '#fff',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    errorTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#d4af37',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    errorMessage: {
        marginTop: 10,
        color: '#ffc0cb',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});

// A simple login screen placeholder to avoid creating new files
const LoginScreen = () => (
    <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>مَحيّاي</Text>
        <Text style={styles.loadingText}>يرجى تسجيل الدخول عبر تطبيق الويب أولاً.</Text>
        <Text style={styles.loadingText}>ميزة تسجيل الدخول للتطبيق الأصلي قيد التطوير.</Text>
    </SafeAreaView>
);

const Tab = createBottomTabNavigator();

const LoadingScreen = () => (
    <View style={styles.center}>
        <ActivityIndicator size="large" color="#d4af37" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
    </View>
);

const ErrorScreen: React.FC<{ message: string }> = ({ message }) => (
    <View style={styles.center}>
        <Text style={{ fontSize: 40 }}>😔</Text>
        <Text style={styles.errorTitle}>حدث خطأ أثناء تحميل التطبيق</Text>
        <Text style={styles.errorMessage}>{message}</Text>
    </View>
);

const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const appData = useAppData();
    if (appData.isDataLoading) {
        return <LoadingScreen />;
    }
    if (appData.appError) {
        return <ErrorScreen message={appData.appError} />;
    }
    return <AppContext.Provider value={appData}>{children}</AppContext.Provider>;
};

const PrayerTimesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // FIX: Pass settings from context to usePrayerTimes hook.
    const { settings } = useAppContext();
    const prayerTimesData = usePrayerTimes(settings);
    return <PrayerTimesContext.Provider value={prayerTimesData}>{children}</PrayerTimesContext.Provider>;
};

const MainApp = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: '#102a21', borderTopColor: 'rgba(255,255,255,0.1)' },
            tabBarActiveTintColor: '#d4af37',
            tabBarInactiveTintColor: '#a3a3a3',
            tabBarLabelStyle: {
                fontWeight: 'bold',
                fontSize: 10,
            }
        }}
    >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'الرئيسية', tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>🏠</Text> }} />
        <Tab.Screen name="Prayers" component={PrayersScreen} options={{ title: 'الصلوات', tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>🕌</Text> }} />
        <Tab.Screen name="Azkar" component={AzkarScreen} options={{ title: 'الأذكار', tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>📿</Text> }} />
        <Tab.Screen name="Quran" component={QuranScreen} options={{ title: 'القرآن', tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>📖</Text> }} />
        <Tab.Screen name="Challenges" component={ChallengesScreen} options={{ title: 'التحديات', tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>🏆</Text> }} />
    </Tab.Navigator>
);

const AppRoutes = () => {
    const authContext = useAuthContext();
    if (authContext.isLoading) {
        return <LoadingScreen />;
    }
    return (
        <NavigationContainer>
            {authContext.profile ? (
                <AppContextProvider>
                    <PrayerTimesProvider>
                        <MainApp />
                    </PrayerTimesProvider>
                </AppContextProvider>
            ) : (
                <LoginScreen />
            )}
        </NavigationContainer>
    );
};

const App = () => (
    <AuthProvider>
        <AppRoutes />
    </AuthProvider>
);

export default App;