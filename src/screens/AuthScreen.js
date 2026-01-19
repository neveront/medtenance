
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { Typography } from '../theme/styles';
import { registerUser, loginUser, signInAnonymous, signInWithGoogle } from '../services/firebaseConfig';


const AuthScreen = ({ navigation }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await loginUser(email, password);
            } else {
                await registerUser(email, password);
            }
            // Navigation handled by App.js auth listener, but for safety:
            // navigation.replace('Main'); 
        } catch (error) {
            let msg = error.message;
            if (error.code === 'auth/email-already-in-use') {
                msg = isLogin
                    ? 'No user found with that email or incorrect password.'
                    : 'That email is already in use. Try logging in instead.';
            }
            if (error.code === 'auth/invalid-email') msg = 'That email address is invalid.';
            if (error.code === 'auth/user-not-found') msg = 'No user found with that email.';
            if (error.code === 'auth/wrong-password') msg = 'Incorrect password.';
            if (error.code === 'auth/credential-already-in-use') msg = 'This email is already associated with another account.';
            if (error.code === 'auth/email-already-in-use' && !isLogin) {
                msg = 'This email is already registered. If you want to save your guest data to this account, you must log in to it (though data merging is limited).';
            }

            Alert.alert('Authentication Failed', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGuest = async () => {
        setLoading(true);
        try {
            await signInAnonymous();
        } catch (error) {
            Alert.alert('Error', 'Could not sign in as guest.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            if (error.code !== 'SIGN_IN_CANCELLED') {
                const isExpoError = error.message?.includes('Expo Go');
                const title = isExpoError ? 'Not Supported' : 'Google Error';
                const msg = isExpoError ? error.message : `${error.message}\n\n(Code: ${error.code})`;
                Alert.alert(title, msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Medtenance</Text>
                        <Text style={styles.subtitle}>Your personal medication assistant</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.tabs}>
                            <TouchableOpacity
                                style={[styles.tab, isLogin && styles.activeTab]}
                                onPress={() => setIsLogin(true)}
                            >
                                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Log In</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, !isLogin && styles.activeTab]}
                                onPress={() => setIsLogin(false)}
                            >
                                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="name@example.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />

                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleAuth}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>{isLogin ? 'Log In' : 'Create Account'}</Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>OR</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity
                                style={styles.googleButton}
                                onPress={handleGoogleSignIn}
                                disabled={loading}
                            >
                                <Text style={styles.googleButtonText}>Continue with Google</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.guestButton}
                        onPress={handleGuest}
                        disabled={loading}
                    >
                        <Text style={styles.guestButtonText}>Continue as Guest</Text>
                    </TouchableOpacity>

                    {!isLogin && (
                        <Text style={styles.note}>
                            Signing up links your current guest data to your account so you don't lose it!
                        </Text>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textLight,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden',
        marginBottom: 24,
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    activeTab: {
        backgroundColor: '#fff',
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textLight,
    },
    activeTabText: {
        color: colors.primary,
    },
    form: {
        padding: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 20,
        color: colors.text,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    guestButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    guestButtonText: {
        color: colors.textLight,
        fontSize: 16,
        fontWeight: '600',
    },
    note: {
        textAlign: 'center',
        color: colors.textLight,
        fontSize: 12,
        marginTop: 10,
        paddingHorizontal: 20,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.borderLight,
    },
    dividerText: {
        paddingHorizontal: 10,
        color: colors.textLight,
        fontSize: 12,
        fontWeight: 'bold',
    },
    googleButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    googleButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default AuthScreen;
