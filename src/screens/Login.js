import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import logo from './../img/logo.png';

function LoginScreen({ navigation }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://192.168.2.133:5028/api/Login/login', 
                {
                    email: email, // Ensure these fields are lowercase
                    password: password,
                    role: 'renter'
                }, 
                {
                    headers: {
                        'Content-Type': 'application/json' // Ensure this header is set correctly
                    }
                });
            
            console.log('Response:', response.data);
            
            if (response.status === 200) {
                const { email, role, userId, renterId, renterFname, renterLname, rentedVehicleCount, upcomingRentCount } = response.data;
                
                if (role === 'renter') {
                    login({ email, role, userId, renterId, renterFname, renterLname, rentedVehicleCount, upcomingRentCount});
                    alert('Login successful');
                    navigation.navigate('Home');
                } else {
                    alert('You do not have access to this application.');
                }
            }
        } catch (error) {
            if (error.response) {
                console.error('Response Error:', error.response.data);
                if (error.response.status === 401) {
                    const errorMessage = error.response.data?.Message || "Invalid credentials. Please try again.";  // Safe fallback
                    alert(errorMessage);
                } else {
                    // Handle other response errors
                    alert(`Error: ${error.response.data?.Message || error.response.statusText}`);
                }
            } else if (error.request) {
                console.error('No Response:', error.request);
                alert('Error: No response from server. Check your network or server configuration.');
            } else {
                console.error('Axios Error:', error.message);
                alert(`Error: ${error.message}`);
            }
        }
    };
    

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image 
                    source={logo} 
                    style={styles.logo} 
                    resizeMode="contain"
                />
                <Text style={styles.logoText}>AutoFleet</Text>
                <Text style={styles.logoText2}>FLEET MANAGEMENT SYSTEM</Text>
            </View>
            
            <View style={styles.formContainer}>
                <Text style={styles.title}>LOGIN</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>
                
                <View style={styles.submitButtonContainer}>
                    <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
                        <Text style={styles.submitButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>
                
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#012A4A', // Light gray background color
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    logo: {
        width: 200,
    },
    logoText: {
        fontSize: 40,
        color: '#FFF',
        fontWeight: 'bold',
        marginBottom: 60,
        marginTop: -70,
        textAlign: 'center',
        fontFamily: 'Poppins Regular',
    },
    logoText2: {
        fontSize: 20,
        color: '#FFF',
        marginBottom: 60,
        marginTop: -70,
        textAlign: 'center',
        fontWeight: 200,
    },
    formContainer: {
        width: '100%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        color: '#FF5C02',
        fontFamily: 'Poppins-Regular',
        fontSize: 40,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 50,
        alignItems: 'center',
    },
    input: {
        height: 50,
        width: '90%',
        borderColor: 'gray',
        borderWidth: .5,
        marginBottom: 12,
        padding: 10,
        borderRadius: 10,
        fontSize: 15,
    },
    submitButtonContainer: {
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#094985',
        width: '50%',
        padding: 10,
        display: 'flex',
        borderRadius: 10,
    },
    submitButtonText: {
        color: '#FFF',
        textAlign: 'center',
    },
});

export default LoginScreen;
