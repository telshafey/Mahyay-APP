import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { AppContext, useAppData, AuthProvider, PrayerTimesContext, useAppContext, usePrayerTimes, PrayerTimesContextType, AppContextType } from '@mahyay/core';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import PrayersPage from './src/screens/PrayersScreen';
import AzkarScreen from './src/screens/AzkarScreen';
import QuranScreen from './src/screens/QuranScreen';
import ChallengesScreen from './src/screens/ChallengesScreen';

// More Stack Screens
import MoreScreen from './src/screens/MoreScreen';
import StatsAndChallengesScreen from './src/screens/more/StatsAndChallengesScreen';
import GoalsScreen from './src/screens/more/GoalsScreen';
import SettingsScreen from './src/screens/more/SettingsScreen';
import AboutScreen from './src/screens/more/AboutScreen';
import SupportScreen from './src/screens/more/SupportScreen';


const Tab = createBottomTabNavigator();
const MoreStack = createStackNavigator();

const LoadingScreen: React.FC = () => (
    <View style={styles.centerScreen}>
        <Text style={styles.loadingText}>مَحيّاي</Text>
        <ActivityIndicator size="large" color="#fff" />
    </View>
);

const ErrorScreen: React.FC<{ message: string }> = ({ message }) => (
    <View style={styles.centerScreen}>
        <Text style={styles.errorText}>😔</Text>
        <Text style={styles.errorTitle}>حدث خطأ</Text>
        <Text style={styles.errorMessage}>{message}</Text>
    </View>
);

const PrayerTimesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { settings, setApiHijriDate, apiHijriDate } = useAppContext();
    const prayerTimesData = usePrayerTimes(settings, setApiHijriDate);

    const contextValue: PrayerTimesContextType = {
        ...prayerTimesData,
        apiHijriDate: apiHijriDate,
    };

    return (
        <PrayerTimesContext.Provider value={contextValue}>
            {children}
        </PrayerTimesContext.Provider>
    );
}

const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const appData = useAppData();
    if (appData.isDataLoading) return <LoadingScreen />;
    if (appData.appError) return <ErrorScreen message={appData.appError} />;

    return (
        <AppContext.Provider value={appData as AppContextType}>
            <PrayerTimesProvider>
                {children}
            </PrayerTimesProvider>
        </AppContext.Provider>
    );
};

const MoreStackScreen = () => (
    <MoreStack.Navigator 
        screenOptions={{
            headerStyle: { backgroundColor: '#1e4d3b', borderBottomWidth: 0, shadowOpacity: 0 },
            headerTintColor: '#fde047',
            headerTitleAlign: 'center',
            headerBackTitleVisible: false,
        }}
    >
        <MoreStack.Screen name="MoreList" component={MoreScreen} options={{ headerShown: false }} />
        <MoreStack.Screen name="Stats" component={StatsAndChallengesScreen} options={{ title: 'الإحصائيات' }} />
        <MoreStack.Screen name="Goals" component={GoalsScreen} options={{ title: 'الأهداف' }} />
        <MoreStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'الإعدادات' }} />
        <MoreStack.Screen name="About" component={AboutScreen} options={{ title: 'عن التطبيق' }} />
        <MoreStack.Screen name="Support" component={SupportScreen} options={{ title: 'الدعم' }} />
    </MoreStack.Navigator>
);


const MainAppTabs: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName = '🏠';
                    if (route.name === 'Home') iconName = '🏠';
                    else if (route.name === 'Prayers') iconName = '🕌';
                    else if (route.name === 'Azkar') iconName = '📿';
                    else if (route.name === 'Quran') iconName = '📖';
                    else if (route.name === 'Challenges') iconName = '🏆';
                    else if (route.name === 'MoreStack') iconName = '☰';
                    return <Text style={{ fontSize: size, color }}>{iconName}</Text>;
                },
                tabBarActiveTintColor: '#fde047',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: { backgroundColor: '#1a2e26', borderTopColor: 'rgba(255,255,255,0.1)' },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'الرئيسية' }} />
            <Tab.Screen name="Prayers" component={PrayersPage} options={{ title: 'الصلوات' }} />
            <Tab.Screen name="Azkar" component={AzkarScreen} options={{ title: 'الأذكار' }} />
            <Tab.Screen name="Quran" component={QuranScreen} options={{ title: 'القرآن' }} />
            <Tab.Screen name="Challenges" component={ChallengesScreen} options={{ title: 'التحديات' }} />
            <Tab.Screen name="MoreStack" component={MoreStackScreen} options={{ title: 'المزيد' }} />
        </Tab.Navigator>
    );
}

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContextProvider>
                <NavigationContainer>
                    <StatusBar style="light" />
                    <MainAppTabs />
                </NavigationContainer>
            </AppContextProvider>
        </AuthProvider>
    );
};

const styles = StyleSheet.create({
    centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e4d3b' },
    loadingText: { fontSize: 40, color: '#fff', marginBottom: 20 },
    errorText: { fontSize: 50, marginBottom: 16 },
    errorTitle: { fontSize: 24, color: '#fff', fontWeight: 'bold', marginBottom: 8 },
    errorMessage: { fontSize: 16, color: '#ffcdd2', textAlign: 'center', paddingHorizontal: 20 },
});

export default App;
